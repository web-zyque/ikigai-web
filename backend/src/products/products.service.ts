import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, desc, eq, ilike, or, sql, inArray, ne } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import { categories, productImages, products, productVariants } from '../db/schema';
import type { 
  CreateCategoryDto, 
  UpdateCategoryDto,
  CreateProductDto, 
  GetProductsQueryDto, 
  UpdateProductDto,
  ProductResponse,
  CategoryResponse,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DB) private db: NeonDatabase<typeof schema>,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ProductResponse> {
    if (!dto.acceptCod && !dto.acceptUpi) {
      throw new BadRequestException('At least one payment method must be enabled');
    }
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, dto.categoryId));

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (category.isArchived) {
      throw new BadRequestException('Cannot assign an archived category to a product');
    }

    const colorNames = dto.color ? dto.color.split(',').map(c => c.trim()).filter(Boolean) : [];
    
    if (colorNames.length > 0) {
      const imagesByColor = dto.images.reduce((acc, img) => {
        const color = img.variantColor || '';
        if (!acc[color]) acc[color] = [];
        acc[color].push(img);
        return acc;
      }, {} as Record<string, typeof dto.images>);

      for (const colorName of colorNames) {
        const colorImages = imagesByColor[colorName] || [];
        if (colorImages.length === 0) {
          throw new BadRequestException(`At least one image is required for color variant: ${colorName}`);
        }
        const mainImages = colorImages.filter(img => img.isMainImage);
        if (mainImages.length !== 1) {
          throw new BadRequestException(`Exactly one main image is required for color variant: ${colorName}`);
        }
      }
    } else {
      const mainImages = dto.images.filter(img => img.isMainImage);
      if (mainImages.length !== 1) {
        throw new BadRequestException('Exactly one main image is required');
      }
    }

    try {
      const [newProduct] = await this.db
        .insert(products)
        .values({
          name: dto.name,
          sku: dto.sku,
          categoryId: dto.categoryId,
          brand: dto.brand,
          description: dto.description,
          sellingPrice: dto.sellingPrice.toString(),
          mrpPrice: dto.mrpPrice?.toString(),
          acceptCod: dto.acceptCod,
          acceptUpi: dto.acceptUpi,
          gstPercentage: dto.gstPercentage.toString(),
          stockQuantity: dto.stockQuantity,
          lowStockThreshold: dto.lowStockThreshold,
          publicationStatus: dto.publicationStatus,
          vehicleCompatibility: dto.vehicleCompatibility,
          productType: dto.productType,
          color: dto.color,
          dimensions: dto.dimensions,
          material: dto.material,
          warranty: dto.warranty,
        })
        .returning();

      const variantMap = new Map<string, string>(); // colorName -> variantId
      if (colorNames.length > 0) {
        const variantsToInsert = colorNames.map(colorName => ({
          productId: newProduct.id,
          colorName,
          stockQuantity: dto.stockQuantity,
        }));

        const createdVariants = await this.db
          .insert(productVariants)
          .values(variantsToInsert)
          .returning();

        createdVariants.forEach(variant => {
          variantMap.set(variant.colorName, variant.id);
        });
      }

      const variantOrderCounters: Record<string, number> = {};
      const imageData = dto.images.map((img) => {
        const colorKey = img.variantColor || 'noVariant';
        if (variantOrderCounters[colorKey] === undefined) variantOrderCounters[colorKey] = 1;
        const displayOrder = img.isMainImage ? 0 : variantOrderCounters[colorKey]++;
        const variantId = img.variantColor ? variantMap.get(img.variantColor) : undefined;
        
        return {
          productId: newProduct.id,
          variantId: variantId || null,
          imageUrl: img.imageUrl,
          cloudinaryPublicId: img.cloudinaryPublicId || null,
          isMainImage: img.isMainImage,
          displayOrder,
          altText: img.altText || null,
        };
      });

      await this.db.insert(productImages).values(imageData);

      return this.getProductById(newProduct.id);
    } catch (error: any) {
      if (error?.code === '23505' && error?.constraint_name?.includes('sku')) {
        throw new ConflictException('SKU already exists');
      }
      throw error;
    }
  }

  async getProducts(query: GetProductsQueryDto): Promise<{
    products: ProductResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (query.page - 1) * query.limit;
    
    const conditions: any[] = [];
    
    if (query.categoryId) {
      conditions.push(eq(products.categoryId, query.categoryId));
    }
    
    if (query.publicationStatus) {
      conditions.push(eq(products.publicationStatus, query.publicationStatus));
    }
    
    if (query.search) {
      conditions.push(
        or(
          ilike(products.name, `%${query.search}%`),
          ilike(products.sku, `%${query.search}%`),
          ilike(products.brand, `%${query.search}%`),
        )
      );
    }

    if (query.inventoryStatus) {
      switch (query.inventoryStatus) {
        case 'out_of_stock':
          conditions.push(eq(products.stockQuantity, 0));
          break;
        case 'low_stock':
          conditions.push(
            and(
              sql`${products.stockQuantity} > 0`,
              sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
            )
          );
          break;
        case 'in_stock':
          conditions.push(
            sql`${products.stockQuantity} > ${products.lowStockThreshold}`
          );
          break;
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [productsData, totalCount] = await Promise.all([
      this.db
        .select({
          product: products,
          category: categories,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(query.limit)
        .offset(offset),
      
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause)
        .then(result => result[0].count),
    ]);

    const productIds = productsData.map(p => p.product.id);
    
    const [images, variants] = await Promise.all([
      productIds.length > 0 
        ? this.db
            .select()
            .from(productImages)
            .where(inArray(productImages.productId, productIds))
            .orderBy(desc(productImages.isMainImage), asc(productImages.displayOrder))
        : [],
      productIds.length > 0
        ? this.db
            .select()
            .from(productVariants)
            .where(inArray(productVariants.productId, productIds))
        : [],
    ]);

    type ImageMap = Record<string, (typeof productImages.$inferSelect)[]>;
    const imagesByProduct: ImageMap = {};
    images.forEach((img: typeof productImages.$inferSelect) => {
      if (!imagesByProduct[img.productId]) imagesByProduct[img.productId] = [];
      imagesByProduct[img.productId].push(img);
    });

    type VariantMap = Record<string, (typeof productVariants.$inferSelect)[]>;
    const variantsByProduct: VariantMap = {};
    variants.forEach((variant: typeof productVariants.$inferSelect) => {
      if (!variantsByProduct[variant.productId]) variantsByProduct[variant.productId] = [];
      variantsByProduct[variant.productId].push(variant);
    });

    const formattedProducts = productsData.map(({ product, category }) => 
      this.formatProductResponse(
        product, 
        category!, 
        imagesByProduct[product.id] || [],
        variantsByProduct[product.id] || []
      )
    );

    return {
      products: formattedProducts,
      total: totalCount,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalCount / query.limit),
    };
  }

  async getProductById(id: string): Promise<ProductResponse> {
    const [productData] = await this.db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (!productData) {
      throw new NotFoundException('Product not found');
    }

    const [images, variants] = await Promise.all([
      this.db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(desc(productImages.isMainImage), asc(productImages.displayOrder)),
      this.db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, id)),
    ]);

    return this.formatProductResponse(productData.product, productData.category!, images, variants);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    const existingProduct = await this.getProductById(id);
    if (!(dto.acceptCod ?? existingProduct.acceptCod) && !(dto.acceptUpi ?? existingProduct.acceptUpi)) {
      throw new BadRequestException('At least one payment method must be enabled');
    }
    
    if (dto.categoryId) {
      const [category] = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, dto.categoryId));

      if (!category) {
        throw new BadRequestException('Category not found');
      }

      if (category.isArchived && existingProduct.category?.id !== dto.categoryId) {
        throw new BadRequestException('Cannot assign an archived category to a product');
      }
    }

    try {
      // Update product data
      const updateData: any = {};
      
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.sku !== undefined) updateData.sku = dto.sku;
      if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
      if (dto.brand !== undefined) updateData.brand = dto.brand;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.sellingPrice !== undefined) updateData.sellingPrice = dto.sellingPrice.toString();
      if (dto.mrpPrice !== undefined) updateData.mrpPrice = dto.mrpPrice?.toString();
      if (dto.acceptCod !== undefined) updateData.acceptCod = dto.acceptCod;
      if (dto.acceptUpi !== undefined) updateData.acceptUpi = dto.acceptUpi;
      if (dto.gstPercentage !== undefined) updateData.gstPercentage = dto.gstPercentage.toString();
      if (dto.stockQuantity !== undefined) updateData.stockQuantity = dto.stockQuantity;
      if (dto.lowStockThreshold !== undefined) updateData.lowStockThreshold = dto.lowStockThreshold;
      if (dto.publicationStatus !== undefined) updateData.publicationStatus = dto.publicationStatus;
      if (dto.vehicleCompatibility !== undefined) updateData.vehicleCompatibility = dto.vehicleCompatibility;
      if (dto.productType !== undefined) updateData.productType = dto.productType;
      if (dto.color !== undefined) updateData.color = dto.color;
      if (dto.dimensions !== undefined) updateData.dimensions = dto.dimensions;
      if (dto.material !== undefined) updateData.material = dto.material;
      if (dto.warranty !== undefined) updateData.warranty = dto.warranty;

      updateData.updatedAt = new Date();

      if (Object.keys(updateData).length > 1) {
        await this.db
          .update(products)
          .set(updateData)
          .where(eq(products.id, id));
      }

      if (dto.images || dto.color !== undefined) {
        const colorNames = (dto.color || existingProduct.color || '').split(',').map(c => c.trim()).filter(Boolean);
        
        await this.db.delete(productVariants).where(eq(productVariants.productId, id));
        await this.db.delete(productImages).where(eq(productImages.productId, id));

        const variantMap = new Map<string, string>();
        if (colorNames.length > 0) {
          const variantsToInsert = colorNames.map(colorName => ({
            productId: id,
            colorName,
            stockQuantity: dto.stockQuantity !== undefined ? dto.stockQuantity : existingProduct.stockQuantity,
          }));

          const createdVariants = await this.db
            .insert(productVariants)
            .values(variantsToInsert)
            .returning();

          createdVariants.forEach(variant => {
            variantMap.set(variant.colorName, variant.id);
          });
        }

        if (dto.images) {
          if (colorNames.length > 0) {
            const imagesByColor = dto.images.reduce((acc, img) => {
              const color = img.variantColor || '';
              if (!acc[color]) acc[color] = [];
              acc[color].push(img);
              return acc;
            }, {} as Record<string, typeof dto.images>);

            for (const colorName of colorNames) {
              const colorImages = imagesByColor[colorName] || [];
              if (colorImages.length === 0) {
                throw new BadRequestException(`At least one image is required for color variant: ${colorName}`);
              }
              const mainImages = colorImages.filter(img => img.isMainImage);
              if (mainImages.length !== 1) {
                throw new BadRequestException(`Exactly one main image is required for color variant: ${colorName}`);
              }
            }
          } else {
            const mainImages = dto.images.filter(img => img.isMainImage);
            if (mainImages.length !== 1) {
              throw new BadRequestException('Exactly one main image is required');
            }
          }

          const variantOrderCounters: Record<string, number> = {};
          const imageData = dto.images.map((img) => {
            const colorKey = img.variantColor || 'noVariant';
            if (variantOrderCounters[colorKey] === undefined) variantOrderCounters[colorKey] = 1;
            const displayOrder = img.isMainImage ? 0 : variantOrderCounters[colorKey]++;
            const variantId = img.variantColor ? variantMap.get(img.variantColor) : undefined;
            
            return {
              productId: id,
              variantId: variantId || null,
              imageUrl: img.imageUrl,
              cloudinaryPublicId: img.cloudinaryPublicId || null,
              isMainImage: img.isMainImage,
              displayOrder,
              altText: img.altText || null,
            };
          });

          await this.db.insert(productImages).values(imageData);
        }
      }

      return this.getProductById(id);
    } catch (error: any) {
      if (error?.code === '23505' && error?.constraint_name?.includes('sku')) {
        throw new ConflictException('SKU already exists');
      }
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await this.db
      .delete(products)
      .where(eq(products.id, id));

    if (result.rowCount === 0) {
      throw new NotFoundException('Product not found');
    }
  }

  async addStock(id: string, quantity: number): Promise<ProductResponse> {

    const existingProduct = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (existingProduct.length === 0) {
      throw new NotFoundException('Product not found');
    }

    await this.db
      .update(products)
      .set({
        stockQuantity: sql`${products.stockQuantity} + ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    return this.getProductById(id);
  }

  private normalizeCategoryName(name: string): string {
    return name.trim().toLowerCase();
  }

  private async generateUniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'category';

    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const conditions = [eq(categories.slug, candidate)];
      if (excludeId) {
        conditions.push(ne(categories.id, excludeId));
      }

      const [existing] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(and(...conditions))
        .limit(1);

      if (!existing) {
        return candidate;
      }

      counter++;
      candidate = `${baseSlug}-${counter}`;
    }
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponse> {
    const trimmedName = dto.name?.trim();
    if (!trimmedName) {
      throw new BadRequestException('Category name is required');
    }

    if (!dto.imageUrl || !dto.imageUrl.trim()) {
      throw new BadRequestException('Category image is required');
    }

    const normalizedName = this.normalizeCategoryName(trimmedName);

    // Case-insensitive duplicate check in DB
    const [existingByName] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(sql`lower(trim(${categories.name})) = ${normalizedName}`)
      .limit(1);

    if (existingByName) {
      throw new ConflictException('A category with this name already exists.');
    }

    const slug = await this.generateUniqueCategorySlug(trimmedName);

    try {
      const [newCategory] = await this.db
        .insert(categories)
        .values({
          name: trimmedName,
          slug,
          imageUrl: dto.imageUrl.trim(),
        })
        .returning();

      return {
        ...newCategory,
        imageUrl: newCategory.imageUrl || undefined,
        isArchived: false,
        productsCount: 0,
      };
    } catch (error: any) {
      if (error?.code === '23505') {
        const detail = (error?.detail || error?.message || '').toLowerCase();
        const constraint = (error?.constraint || '').toLowerCase();
        if (constraint.includes('slug') || detail.includes('slug') || detail.includes('key (slug)')) {
          throw new ConflictException('A category with this URL slug already exists.');
        }
        throw new ConflictException('A category with this name already exists.');
      }
      throw error;
    }
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    const [existing] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (!trimmedName) {
        throw new BadRequestException('Category name cannot be empty');
      }

      const normalizedName = this.normalizeCategoryName(trimmedName);

      // Check if another category already uses this name (excluding current category ID)
      const [existingByName] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(
          and(
            sql`lower(trim(${categories.name})) = ${normalizedName}`,
            ne(categories.id, id),
          ),
        )
        .limit(1);

      if (existingByName) {
        throw new ConflictException('A category with this name already exists.');
      }

      updateData.name = trimmedName;

      // Only re-generate slug if the category name actually changed
      const existingNormalized = this.normalizeCategoryName(existing.name);
      if (normalizedName !== existingNormalized) {
        updateData.slug = await this.generateUniqueCategorySlug(trimmedName, id);
      }
    }

    if (dto.imageUrl !== undefined) {
      if (!dto.imageUrl || !dto.imageUrl.trim()) {
        throw new BadRequestException('Category image cannot be empty');
      }
      updateData.imageUrl = dto.imageUrl.trim();
    } else if (!existing.imageUrl || !existing.imageUrl.trim()) {
      throw new BadRequestException('Category image is required');
    }

    try {
      const [updated] = await this.db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id))
        .returning();

      const [countResult] = await this.db
        .select({ count: sql<number>`cast(count(${products.id}) as integer)` })
        .from(products)
        .where(eq(products.categoryId, id));

      return {
        ...updated,
        imageUrl: updated.imageUrl || undefined,
        isArchived: Boolean(updated.isArchived),
        productsCount: Number(countResult?.count) || 0,
      };
    } catch (error: any) {
      if (error?.code === '23505') {
        const detail = (error?.detail || error?.message || '').toLowerCase();
        const constraint = (error?.constraint || '').toLowerCase();
        if (constraint.includes('slug') || detail.includes('slug') || detail.includes('key (slug)')) {
          throw new ConflictException('A category with this URL slug already exists.');
        }
        throw new ConflictException('A category with this name already exists.');
      }
      throw error;
    }
  }

  async getCategories(includeArchived = false): Promise<CategoryResponse[]> {
    const baseQuery = this.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        isArchived: categories.isArchived,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productsCount: sql<number>`cast(count(${products.id}) as integer)`,
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id));

    const result = includeArchived
      ? await baseQuery.groupBy(categories.id).orderBy(asc(categories.name))
      : await baseQuery.where(eq(categories.isArchived, false)).groupBy(categories.id).orderBy(asc(categories.name));
    
    return result.map(cat => ({
      ...cat,
      imageUrl: cat.imageUrl || undefined,
      isArchived: Boolean(cat.isArchived),
      productsCount: Number(cat.productsCount) || 0,
    }));
  }

  async archiveCategory(id: string): Promise<CategoryResponse> {
    const [existing] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const [updated] = await this.db
      .update(categories)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    const [countResult] = await this.db
      .select({ count: sql<number>`cast(count(${products.id}) as integer)` })
      .from(products)
      .where(eq(products.categoryId, id));

    return {
      ...updated,
      imageUrl: updated.imageUrl || undefined,
      isArchived: true,
      productsCount: Number(countResult?.count) || 0,
    };
  }

  async restoreCategory(id: string): Promise<CategoryResponse> {
    const [existing] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const [updated] = await this.db
      .update(categories)
      .set({
        isArchived: false,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    const [countResult] = await this.db
      .select({ count: sql<number>`cast(count(${products.id}) as integer)` })
      .from(products)
      .where(eq(products.categoryId, id));

    return {
      ...updated,
      imageUrl: updated.imageUrl || undefined,
      isArchived: false,
      productsCount: Number(countResult?.count) || 0,
    };
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const [existing] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const [assignedProducts] = await this.db
      .select({ count: sql<number>`cast(count(${products.id}) as integer)` })
      .from(products)
      .where(eq(products.categoryId, id));

    const productCount = Number(assignedProducts?.count) || 0;
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${existing.name}" because it has ${productCount} assigned product${productCount > 1 ? 's' : ''}. Please reassign or delete the products first.`
      );
    }

    try {
      await this.db.delete(categories).where(eq(categories.id, id));
      return { success: true, message: 'Category deleted successfully' };
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new BadRequestException(
          'Cannot delete category because dependent records exist. Please reassign or remove them first.'
        );
      }
      throw error;
    }
  }

  private formatProductResponse(
    product: typeof products.$inferSelect,
    category: typeof categories.$inferSelect,
    images: (typeof productImages.$inferSelect)[],
    variants: (typeof productVariants.$inferSelect)[] = []
  ): ProductResponse {

    let inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
    if (product.stockQuantity === 0) {
      inventoryStatus = 'out_of_stock';
    } else if (product.stockQuantity <= product.lowStockThreshold) {
      inventoryStatus = 'low_stock';
    } else {
      inventoryStatus = 'in_stock';
    }

    const imagesByVariant = images.reduce((acc, img) => {
      const key = img.variantId || 'noVariant';
      if (!acc[key]) acc[key] = [];
      acc[key].push(img);
      return acc;
    }, {} as Record<string, typeof images>);

    const sortImages = (imgs: (typeof productImages.$inferSelect)[]) => {
      return [...imgs].sort((a, b) => {
        if (a.isMainImage && !b.isMainImage) return -1;
        if (!a.isMainImage && b.isMainImage) return 1;
        return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      });
    };

    const formattedVariants = variants.map(variant => {
      const sortedVariantImages = sortImages(imagesByVariant[variant.id] || []);
      return {
        id: variant.id,
        colorName: variant.colorName,
        sku: variant.sku || undefined,
        stockQuantity: variant.stockQuantity,
        images: sortedVariantImages.map(img => ({
          id: img.id,
          imageUrl: img.imageUrl,
          cloudinaryPublicId: img.cloudinaryPublicId || undefined,
          isMainImage: img.isMainImage,
          displayOrder: img.displayOrder,
          altText: img.altText || undefined,
        })),
      };
    });

    let sortedAllImages: (typeof productImages.$inferSelect)[] = [];
    if (variants.length > 0) {
      for (const variant of variants) {
        sortedAllImages.push(...sortImages(imagesByVariant[variant.id] || []));
      }
      if (imagesByVariant['noVariant']) {
        sortedAllImages.push(...sortImages(imagesByVariant['noVariant']));
      }
    } else {
      sortedAllImages = sortImages(images);
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      brand: product.brand || undefined,
      description: product.description || undefined,
      sellingPrice: product.sellingPrice,
      mrpPrice: product.mrpPrice || undefined,
      acceptCod: product.acceptCod,
      acceptUpi: product.acceptUpi,
      gstPercentage: product.gstPercentage || '18.00',
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      inventoryStatus,
      publicationStatus: product.publicationStatus,
      vehicleCompatibility: product.vehicleCompatibility as string[] || undefined,
      productType: product.productType || undefined,
      color: product.color || undefined,
      dimensions: product.dimensions || undefined,
      material: product.material || undefined,
      warranty: product.warranty || undefined,
      images: sortedAllImages.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        cloudinaryPublicId: img.cloudinaryPublicId || undefined,
        isMainImage: img.isMainImage,
        displayOrder: img.displayOrder,
        altText: img.altText || undefined,
        variantId: img.variantId || undefined,
      })),
      variants: formattedVariants.length > 0 ? formattedVariants : undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
