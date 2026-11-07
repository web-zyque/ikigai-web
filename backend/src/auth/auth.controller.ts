import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { LoginDto, SendOtpDto, SignupDto, VerifyOtpDto, CreateAdminDto, UpdateAdminProfileDto, ChangePasswordDto } from './dto/auth.dto';
import { LoginSchema, SendOtpSchema, SignupSchema, VerifyOtpSchema, CreateAdminSchema, UpdateAdminProfileSchema, ChangePasswordSchema } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

const COOKIE_NAME = 'token';

const cookieOptions = () => ({
  httpOnly: true,

  sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),

  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('otp/send')
  @HttpCode(200)
  sendOtp(@Body() body: unknown) {
    const dto = SendOtpSchema.parse(body);
    return this.auth.sendOtp(dto.phone);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('otp/verify')
  @HttpCode(200)
  verifyOtp(@Body() body: unknown) {
    const dto = VerifyOtpSchema.parse(body);
    return this.auth.verifyOtp(dto.phone, dto.otp);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('signup')
  async signup(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = SignupSchema.parse(body);
    const token = await this.auth.signup(dto);
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return { ok: true };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const dto = LoginSchema.parse(body);
    const token = await this.auth.login(dto.identifier, dto.password);
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    const { maxAge, ...opts } = cookieOptions();
    res.clearCookie(COOKIE_NAME, opts);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { id: string; role: string } }) {
    return this.auth.me(req.user.id, req.user.role);
  }

  @Post('admin')
  @HttpCode(201)
  async createAdmin(@Body() body: unknown) {
    const dto = CreateAdminSchema.parse(body);
    return this.auth.createAdmin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @HttpCode(200)
  updateProfile(
    @Req() req: Request & { user: { id: string; role: string } },
    @Body() body: unknown,
  ) {
    const dto = UpdateAdminProfileSchema.parse(body);
    return this.auth.updateAdminProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  @HttpCode(200)
  changePassword(
    @Req() req: Request & { user: { id: string; role: string } },
    @Body() body: unknown,
  ) {
    const dto = ChangePasswordSchema.parse(body);
    return this.auth.changeAdminPassword(req.user.id, dto);
  }
}