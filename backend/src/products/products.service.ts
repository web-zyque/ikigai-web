import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, desc, eq, ilike, or, sql, inArray } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import { categories, productImages, products } from '../db/schema';
import type { 
  CreateCategoryDto, 
  CreateProductDto, 
  GetProductsQueryDto, 
  UpdateProductDto,
  ProductResponse,
  CategoryResponse,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DB) private db: NeonHttpDatabase<typeof schema>,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ProductResponse> {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, dto.categoryId));

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const mainImages = dto.images.filter(img => img.isMainImage);
    if (mainImages.length !== 1) {
      throw new BadRequestException('Exactly one main image is required');
    }

    try {
      // Create product first
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

      // Create product images separately
      const imageData = dto.images.map((img, index) => ({
        productId: newProduct.id,
        imageUrl: img.imageUrl,
        isMainImage: img.isMainImage,
        displayOrder: img.isMainImage ? 0 : index + 1,
        altText: img.altText,
      }));

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
    const images = productIds.length > 0 
      ? await this.db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.displayOrder))
      : [];

    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.productId]) acc[img.productId] = [];
      acc[img.productId].push(img);
      return acc;
    }, {} as Record<string, typeof images>);

    const formattedProducts = productsData.map(({ product, category }) => 
      this.formatProductResponse(product, category!, imagesByProduct[product.id] || [])
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

    const images = await this.db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.displayOrder));

    return this.formatProductResponse(productData.product, productData.category!, images);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    const existingProduct = await this.getProductById(id);
    
    if (dto.categoryId) {
      const [category] = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, dto.categoryId));

      if (!category) {
        throw new BadRequestException('Category not found');
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

      if (Object.keys(updateData).length > 1) { // More than just updatedAt
        await this.db
          .update(products)
          .set(updateData)
          .where(eq(products.id, id));
      }

      // Update images if provided
      if (dto.images) {
        // Ensure only one main image
        const mainImages = dto.images.filter(img => img.isMainImage);
        if (mainImages.length !== 1) {
          throw new BadRequestException('Exactly one main image is required');
        }

        // Delete existing images first
        await this.db.delete(productImages).where(eq(productImages.productId, id));

        // Create new images
        const imageData = dto.images.map((img, index) => ({
          productId: id,
          imageUrl: img.imageUrl,
          isMainImage: img.isMainImage,
          displayOrder: img.isMainImage ? 0 : index + 1,
          altText: img.altText,
        }));

        await this.db.insert(productImages).values(imageData);
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

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponse> {
    const slug = dto.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const [newCategory] = await this.db
        .insert(categories)
        .values({
          name: dto.name,
          slug,
          description: dto.description,
        })
        .returning();

      return {
        ...newCategory,
        description: newCategory.description || undefined,
      };
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async getCategories(): Promise<CategoryResponse[]> {
    const result = await this.db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));
    
    return result.map(cat => ({
      ...cat,
      description: cat.description || undefined,
    }));
  }

  private formatProductResponse(
    product: typeof products.$inferSelect,
    category: typeof categories.$inferSelect,
    images: (typeof productImages.$inferSelect)[]
  ): ProductResponse {

    let inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
    if (product.stockQuantity === 0) {
      inventoryStatus = 'out_of_stock';
    } else if (product.stockQuantity <= product.lowStockThreshold) {
      inventoryStatus = 'low_stock';
    } else {
      inventoryStatus = 'in_stock';
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
      images: images.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        isMainImage: img.isMainImage,
        displayOrder: img.displayOrder,
        altText: img.altText || undefined,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}