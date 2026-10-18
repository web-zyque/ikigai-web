import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomInt } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import { admins, otps, users } from '../db/schema';
import type { CreateAdminDto, SignupDto } from './dto/auth.dto';

const normalizePhone = (value: string) => {
  const cleaned = value.replace(/[\s()-]/g, '');
  if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^91\d{10}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
};

const E164 = /^\+[1-9]\d{9,14}$/;

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private db: NeonHttpDatabase<typeof schema>,
    private jwt: JwtService,
  ) {}

  async sendOtp(phone: string) {
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone));
    if (existing) throw new ConflictException('Phone already registered');

    const code = randomInt(100000, 1000000).toString();
    
    // Only log OTP in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Generated OTP:', { phone, code });
    }

    await this.db.insert(otps).values({
      phone,
      codeHash: await argon2.hash(code),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await this.sendSms(
      phone,
      `Your verification code is ${code}. Valid for 5 minutes.`,
    );
    return { ok: true };
  }

  async verifyOtp(phone: string, otp: string) {
    const [row] = await this.db
      .select()
      .from(otps)
      .where(and(eq(otps.phone, phone), eq(otps.consumed, false)))
      .orderBy(desc(otps.createdAt))
      .limit(1);

    if (!row || row.expiresAt < new Date() || row.attempts >= 5) {
      throw new BadRequestException('OTP invalid or expired');
    }

    const valid = await argon2.verify(row.codeHash, otp);
    
    if (!valid) {
      await this.db
        .update(otps)
        .set({ attempts: row.attempts + 1 })
        .where(eq(otps.id, row.id));
      throw new BadRequestException('Wrong OTP');
    }

    await this.db
      .update(otps)
      .set({ consumed: true })
      .where(eq(otps.id, row.id));

    return { ok: true };
  }

  async signup(dto: SignupDto) {
    const [row] = await this.db
      .select()
      .from(otps)
      .where(and(
        eq(otps.phone, dto.phone), 
        eq(otps.consumed, true)
      ))
      .orderBy(desc(otps.createdAt))
      .limit(1);

    if (!row || row.createdAt < new Date(Date.now() - 10 * 60 * 1000)) {
      throw new BadRequestException('Please verify your OTP first');
    }

    const valid = await argon2.verify(row.codeHash, dto.otp);
    
    if (!valid) {
      throw new BadRequestException('Wrong OTP');
    }

    try {
      const [user] = await this.db
        .insert(users)
        .values({
          fullName: dto.fullName.trim(),
          phone: dto.phone,
          passwordHash: await argon2.hash(dto.password),
        })
        .returning();
      return this.signToken(user.id, 'CUSTOMER');
    } catch (e: any) {
      if (e?.code === '23505')
        throw new ConflictException('Phone already registered');
      throw e;
    }
  }

  async login(identifier: string, password: string) {

    const normalizedPhone = normalizePhone(identifier);
    const isPhone = E164.test(normalizedPhone);
    
    if (isPhone) {

      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.phone, normalizedPhone));
      if (!user || !(await argon2.verify(user.passwordHash, password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.signToken(user.id, 'CUSTOMER');
    } else {

      const [admin] = await this.db
        .select()
        .from(admins)
        .where(and(eq(admins.adminId, identifier), eq(admins.isActive, true)));
      if (!admin || !(await argon2.verify(admin.passwordHash, password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.signToken(admin.id, admin.role);
    }
  }

  async me(userId: string, role?: string) {
    if (role === 'ADMIN' || role === 'STAFF') {
      const [admin] = await this.db
        .select({
          id: admins.id,
          adminId: admins.adminId,
          fullName: admins.fullName,
          email: admins.email,
          role: admins.role,
          isActive: admins.isActive,
          createdAt: admins.createdAt,
        })
        .from(admins)
        .where(eq(admins.id, userId));
      if (!admin) throw new UnauthorizedException();
      return { ...admin, role: admin.role };
    } else {
      const [user] = await this.db
        .select({
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId));
      if (!user) throw new UnauthorizedException();
      return { ...user, role: 'CUSTOMER' };
    }
  }

  async createAdmin(dto: CreateAdminDto) {
    try {
      const [admin] = await this.db
        .insert(admins)
        .values({
          adminId: dto.adminId,
          fullName: dto.fullName.trim(),
          email: dto.email.toLowerCase(),
          passwordHash: await argon2.hash(dto.password),
          role: dto.role,
        })
        .returning();
      return {
        id: admin.id,
        adminId: admin.adminId,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      };
    } catch (e: any) {
      if (e?.code === '23505') {
        if (e.constraint === 'admins_admin_id_unique') {
          throw new ConflictException('Admin ID already exists');
        }
        if (e.constraint === 'admins_email_unique') {
          throw new ConflictException('Email already registered');
        }
      }
      throw e;
    }
  }

  private signToken(userId: string, role: 'CUSTOMER' | 'ADMIN' | 'STAFF' = 'CUSTOMER') {
    return this.jwt.sign({ sub: userId, role });
  }

  private async sendSms(phone: string, message: string) {
    // Only log SMS content in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SMS] ${phone}: ${message}`);
    }
    
    if (process.env.NODE_ENV === 'production') {
      // TODO: call MSG91 / Twilio here
      throw new Error('SMS provider not configured');
    }
  }
}
