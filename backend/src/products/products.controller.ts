import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AdminGuard, JwtAuthGuard, StaffGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  GetProductsQueryDto,
  UpdateProductDto,
  AddStockDto,
} from './dto/product.dto';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateProductSchema,
  GetProductsQuerySchema,
  UpdateProductSchema,
  AddStockSchema,
} from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(StaffGuard)
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  async getProducts(@Query(new ZodValidationPipe(GetProductsQuerySchema)) query: GetProductsQueryDto) {
    return this.productsService.getProducts(query);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Patch(':id')
  @UseGuards(StaffGuard)
  async updateProduct(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductSchema)) dto: UpdateProductDto
  ) {
    return this.productsService.updateProduct(id, dto);
  }

  @Patch(':id/stock')
  @UseGuards(StaffGuard)
  async addStock(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AddStockSchema)) dto: AddStockDto
  ) {
    return this.productsService.addStock(id, dto.quantity);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteProduct(@Param('id') id: string) {
    await this.productsService.deleteProduct(id);
    return { message: 'Product deleted successfully' };
  }
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(StaffGuard)
  async createCategory(
    @Body(new ZodValidationPipe(CreateCategorySchema)) dto: CreateCategoryDto,
  ) {
    return this.productsService.createCategory(dto);
  }

  @Get()
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Patch(':id')
  @UseGuards(StaffGuard)
  async updateCategory(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCategorySchema)) dto: UpdateCategoryDto,
  ) {
    return this.productsService.updateCategory(id, dto);
  }
}