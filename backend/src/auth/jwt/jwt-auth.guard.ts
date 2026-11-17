import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DB } from '../../db/db.module';
import * as schema from '../../db/schema';
import { admins } from '../../db/schema';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, @Inject(DB) private db: NeonDatabase<typeof schema>) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.token;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify<{ sub: string; role?: string }>(token);
      if (payload.role === 'ADMIN' || payload.role === 'STAFF') {
        const [admin] = await this.db.select({ id: admins.id }).from(admins).where(and(eq(admins.id, payload.sub), eq(admins.isActive, true))).limit(1);
        if (!admin) throw new UnauthorizedException();
      }
      req.user = { id: payload.sub, role: payload.role || 'CUSTOMER' };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwt: JwtService, @Inject(DB) private db: NeonDatabase<typeof schema>) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.token;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify<{ sub: string; role?: string }>(token);
      if (payload.role !== 'ADMIN') {
        throw new UnauthorizedException('Admin access required');
      }
      const [admin] = await this.db.select({ id: admins.id }).from(admins).where(and(eq(admins.id, payload.sub), eq(admins.isActive, true))).limit(1);
      if (!admin) throw new UnauthorizedException();
      req.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private jwt: JwtService, @Inject(DB) private db: NeonDatabase<typeof schema>) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.token;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify<{ sub: string; role?: string }>(token);
      if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') {
        throw new UnauthorizedException('Staff access required');
      }
      const [admin] = await this.db.select({ id: admins.id }).from(admins).where(and(eq(admins.id, payload.sub), eq(admins.isActive, true))).limit(1);
      if (!admin) throw new UnauthorizedException();
      req.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
