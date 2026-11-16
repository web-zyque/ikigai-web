import { CreateProductSchema, UpdateProductSchema } from './dto/product.dto';
import { AddToCartSchema, MergeGuestCartSchema } from '../cart/dto/cart.dto';
import { CreateOrderSchema } from '../orders/dto/order.dto';
import { ProductsService } from './products.service';

describe('Size Variants & Warranty Integration Tests', () => {
  let productsService: ProductsService;

  beforeEach(() => {
    // Instantiate with mock db
    productsService = new ProductsService({} as any);
  });

  describe('Warranty Resolution Logic', () => {
    it('should resolve "No Warranty" correctly', () => {
      const res = (productsService as any).resolveWarrantyFields({
        warranty: 'No Warranty',
      });
      expect(res).toEqual({
        warranty: 'No Warranty',
        warrantyType: 'none',
        warrantyDuration: null,
        warrantyUnit: null,
      });
    });

    it('should resolve "Lifetime Warranty" correctly', () => {
      const res = (productsService as any).resolveWarrantyFields({
        warranty: 'Lifetime Warranty',
      });
      expect(res).toEqual({
        warranty: 'Lifetime Warranty',
        warrantyType: 'lifetime',
        warrantyDuration: null,
        warrantyUnit: null,
      });
    });

    it('should parse "30 Days Warranty" into custom warranty with duration 30 and unit days', () => {
      const res = (productsService as any).resolveWarrantyFields({
        warranty: '30 Days Warranty',
      });
      expect(res).toEqual({
        warranty: '30 Days Warranty',
        warrantyType: 'custom',
        warrantyDuration: 30,
        warrantyUnit: 'days',
      });
    });

    it('should parse "6 Months Warranty" into custom warranty with duration 6 and unit months', () => {
      const res = (productsService as any).resolveWarrantyFields({
        warranty: '6 Months Warranty',
      });
      expect(res).toEqual({
        warranty: '6 Months Warranty',
        warrantyType: 'custom',
        warrantyDuration: 6,
        warrantyUnit: 'months',
      });
    });

    it('should parse "1 Year Warranty" into custom warranty with duration 1 and unit years', () => {
      const res = (productsService as any).resolveWarrantyFields({
        warranty: '1 Year Warranty',
      });
      expect(res).toEqual({
        warranty: '1 Year Warranty',
        warrantyType: 'custom',
        warrantyDuration: 1,
        warrantyUnit: 'years',
      });
    });

    it('should format structured warranty into string when structured fields are provided', () => {
      const res = (productsService as any).resolveWarrantyFields({
        warrantyType: 'custom',
        warrantyDuration: 3,
        warrantyUnit: 'years',
      });
      expect(res).toEqual({
        warranty: '3 Years Warranty',
        warrantyType: 'custom',
        warrantyDuration: 3,
        warrantyUnit: 'years',
      });
    });
  });

  describe('Product DTO Validation', () => {
    const baseValidProduct = {
      name: 'High Performance Brakes',
      sku: 'IKG-BRK-001',
      categoryId: 'b1d03426-5b48-4cb9-99e0-d096ef1ea8d1',
      brand: 'Brembo',
      sellingPrice: 15000,
      stockQuantity: 25,
      images: [
        {
          imageUrl: 'https://example.com/image1.jpg',
          isMainImage: true,
        },
      ],
    };

    it('should validate and preserve Standard Size variants', () => {
      const payload = {
        ...baseValidProduct,
        sizeType: 'standard',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        dimensions: 'S, M, L, XL, XXL',
      };
      const validated = CreateProductSchema.parse(payload);
      expect(validated.sizeType).toBe('standard');
      expect(validated.sizes).toEqual(['S', 'M', 'L', 'XL', 'XXL']);
      expect(validated.dimensions).toBe('S, M, L, XL, XXL');
    });

    it('should validate and preserve Inch Size variants', () => {
      const payload = {
        ...baseValidProduct,
        sizeType: 'inch',
        sizes: ['24 Inches', '26 Inches', '28 Inches'],
        dimensions: '24 Inches, 26 Inches, 28 Inches',
      };
      const validated = CreateProductSchema.parse(payload);
      expect(validated.sizeType).toBe('inch');
      expect(validated.sizes).toEqual(['24 Inches', '26 Inches', '28 Inches']);
    });

    it('should validate and preserve both Color and Size variants', () => {
      const payload = {
        ...baseValidProduct,
        color: 'Black, Red',
        sizeType: 'standard',
        sizes: ['M', 'L'],
      };
      const validated = CreateProductSchema.parse(payload);
      expect(validated.color).toBe('Black, Red');
      expect(validated.sizeType).toBe('standard');
      expect(validated.sizes).toEqual(['M', 'L']);
    });

    it('should validate Warranty in CreateProductSchema', () => {
      const payload = {
        ...baseValidProduct,
        warranty: '6 Months Warranty',
        warrantyType: 'custom',
        warrantyDuration: 6,
        warrantyUnit: 'months',
      };
      const validated = CreateProductSchema.parse(payload);
      expect(validated.warranty).toBe('6 Months Warranty');
      expect(validated.warrantyType).toBe('custom');
      expect(validated.warrantyDuration).toBe(6);
      expect(validated.warrantyUnit).toBe('months');
    });

    it('should allow partial updates in UpdateProductSchema', () => {
      const updatePayload = {
        sizes: ['XL', 'XXL'],
        sizeType: 'standard' as const,
        warranty: 'Lifetime Warranty',
      };
      const validated = UpdateProductSchema.parse(updatePayload);
      expect(validated.sizes).toEqual(['XL', 'XXL']);
      expect(validated.sizeType).toBe('standard');
      expect(validated.warranty).toBe('Lifetime Warranty');
    });
  });

  describe('Cart & Orders Integration DTOs', () => {
    it('should accept size in AddToCartSchema', () => {
      const cartPayload = {
        productId: 'b1d03426-5b48-4cb9-99e0-d096ef1ea8d1',
        size: 'L',
        quantity: 2,
      };
      const validated = AddToCartSchema.parse(cartPayload);
      expect(validated.size).toBe('L');
      expect(validated.quantity).toBe(2);
    });

    it('should accept size in MergeGuestCartSchema', () => {
      const mergePayload = {
        guestCartId: 'a1d03426-5b48-4cb9-99e0-d096ef1ea8d1',
        items: [
          {
            productId: 'b1d03426-5b48-4cb9-99e0-d096ef1ea8d1',
            size: '28 Inches',
            quantity: 1,
          },
        ],
      };
      const validated = MergeGuestCartSchema.parse(mergePayload);
      expect(validated.items[0].size).toBe('28 Inches');
    });

    it('should accept size in CreateOrderSchema buyNowItem', () => {
      const orderPayload = {
        addressId: 'b1d03426-5b48-4cb9-99e0-d096ef1ea8d1',
        paymentMethod: 'COD',
        idempotencyKey: 'c1d03426-5b48-4cb9-99e0-d096ef1ea8d1',
        buyNowItem: {
          productId: 'b1d03426-5b48-4cb9-99e0-d096ef1ea8d1',
          size: 'XL',
          quantity: 1,
        },
      };
      const validated = CreateOrderSchema.parse(orderPayload);
      expect(validated.buyNowItem?.size).toBe('XL');
    });
  });
});
