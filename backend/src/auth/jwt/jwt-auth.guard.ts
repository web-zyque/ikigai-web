import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.token;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify<{ sub: string; role?: string }>(token);
      req.user = { id: payload.sub, role: payload.role || 'CUSTOMER' };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.token;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify<{ sub: string; role?: string }>(token);
      if (payload.role !== 'ADMIN') {
        throw new UnauthorizedException('Admin access required');
      }
      req.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.token;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify<{ sub: string; role?: string }>(token);
      if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') {
        throw new UnauthorizedException('Staff access required');
      }
      req.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
