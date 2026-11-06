import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import { userAddresses, users } from '../db/schema';
import type { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(@Inject(DB) private readonly db: NeonDatabase<typeof schema>) {}

  list(userId: string) {
    return this.db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId))
      .orderBy(asc(userAddresses.createdAt));
  }

  async get(userId: string, addressId: string) {
    const [address] = await this.db
      .select()
      .from(userAddresses)
      .where(and(eq(userAddresses.userId, userId), eq(userAddresses.id, addressId)))
      .limit(1);
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    return this.db.transaction(async (tx) => {
      await this.lockUser(tx, userId);
      const existing = await tx
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId));
      const isDefault = dto.isDefault || existing.length === 0;
      if (isDefault) {
        await tx
          .update(userAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(userAddresses.userId, userId));
      }
      const [address] = await tx
        .insert(userAddresses)
        .values({
          userId,
          fullName: dto.fullName,
          phone: dto.phone,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2 || null,
          landmark: dto.landmark || null,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          country: dto.country,
          addressType: dto.addressType,
          isDefault,
        })
        .returning();
      return address;
    });
  }

  async update(userId: string, addressId: string, dto: UpdateAddressDto) {
    return this.db.transaction(async (tx) => {
      await this.lockUser(tx, userId);
      const [existing] = await tx
        .select()
        .from(userAddresses)
        .where(and(eq(userAddresses.userId, userId), eq(userAddresses.id, addressId)))
        .limit(1);
      if (!existing) throw new NotFoundException('Address not found');

      if (dto.isDefault === true) {
        await tx
          .update(userAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(userAddresses.userId, userId));
      }

      const updateData: Partial<typeof userAddresses.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
      if (dto.phone !== undefined) updateData.phone = dto.phone;
      if (dto.addressLine1 !== undefined) updateData.addressLine1 = dto.addressLine1;
      if (dto.addressLine2 !== undefined) updateData.addressLine2 = dto.addressLine2 || null;
      if (dto.landmark !== undefined) updateData.landmark = dto.landmark || null;
      if (dto.city !== undefined) updateData.city = dto.city;
      if (dto.state !== undefined) updateData.state = dto.state;
      if (dto.postalCode !== undefined) updateData.postalCode = dto.postalCode;
      if (dto.country !== undefined) updateData.country = dto.country;
      if (dto.addressType !== undefined) updateData.addressType = dto.addressType;
      if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;

      const [updated] = await tx
        .update(userAddresses)
        .set(updateData)
        .where(and(eq(userAddresses.userId, userId), eq(userAddresses.id, addressId)))
        .returning();
      return updated;
    });
  }

  async remove(userId: string, addressId: string) {
    return this.db.transaction(async (tx) => {
      await this.lockUser(tx, userId);
      const [deleted] = await tx
        .delete(userAddresses)
        .where(and(eq(userAddresses.userId, userId), eq(userAddresses.id, addressId)))
        .returning();
      if (!deleted) throw new NotFoundException('Address not found');

      if (deleted.isDefault) {
        const [nextDefault] = await tx
          .select({ id: userAddresses.id })
          .from(userAddresses)
          .where(eq(userAddresses.userId, userId))
          .orderBy(asc(userAddresses.createdAt))
          .limit(1);
        if (nextDefault) {
          await tx
            .update(userAddresses)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(userAddresses.id, nextDefault.id));
        }
      }
      const addresses = await tx
        .select()
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId))
        .orderBy(asc(userAddresses.createdAt));
      return { addresses };
    });
  }

  async setDefault(userId: string, addressId: string) {
    return this.db.transaction(async (tx) => {
      await this.lockUser(tx, userId);
      const [address] = await tx
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(and(eq(userAddresses.userId, userId), eq(userAddresses.id, addressId)))
        .limit(1);
      if (!address) throw new NotFoundException('Address not found');

      await tx
        .update(userAddresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(userAddresses.userId, userId));
      await tx
        .update(userAddresses)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(and(eq(userAddresses.userId, userId), eq(userAddresses.id, addressId)));
      const addresses = await tx
        .select()
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId))
        .orderBy(asc(userAddresses.createdAt));
      return { addresses };
    });
  }

  private async lockUser(tx: any, userId: string): Promise<void> {
    const [user] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .for('update');
    if (!user) throw new NotFoundException('User not found');
  }
}
