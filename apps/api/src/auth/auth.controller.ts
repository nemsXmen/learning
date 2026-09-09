import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { loginSchema, passwordSchema, registerSchema, emailSchema } from '@app/validation';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { AuthService, type PublicUser, type Session } from './auth.service';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt.guard';
import { RateLimitService } from './rate-limit.service';
import type { IssuedTokens } from './token.service';

const refreshSchema = z.object({ refreshToken: z.string().min(1) });
const verifyEmailSchema = z.object({ token: z.string().min(1) });
const forgotSchema = z.object({ email: emailSchema });
const resetSchema = z.object({ token: z.string().min(1), password: passwordSchema });

/** Best-effort client address, used only as a rate-limit discriminator. */
function clientIp(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return (first ?? request.ip ?? 'unknown').trim();
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post('register')
  async register(
    @Req() request: Request,
    @Body(new ZodValidationPipe(registerSchema)) body: z.infer<typeof registerSchema>,
  ): Promise<Session> {
    await this.rateLimit.consume('register', clientIp(request));
    return this.auth.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() request: Request,
    @Body(new ZodValidationPipe(loginSchema)) body: z.infer<typeof loginSchema>,
  ): Promise<Session> {
    // Per IP and per account: either limit alone is trivially worked around.
    await this.rateLimit.consume('login', clientIp(request));
    await this.rateLimit.consume('login', body.email);

    const session = await this.auth.login(body.email, body.password);
    await this.rateLimit.reset('login', body.email);
    return session;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Body(new ZodValidationPipe(refreshSchema)) body: z.infer<typeof refreshSchema>,
  ): Promise<IssuedTokens> {
    await this.rateLimit.consume('refresh', clientIp(request));
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body(new ZodValidationPipe(refreshSchema)) body: z.infer<typeof refreshSchema>,
  ): Promise<void> {
    await this.auth.logout(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest): Promise<PublicUser> {
    // The subject comes from the token, never from the body (docs/rules.md #30).
    return this.auth.me(request.user.sub);
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) body: z.infer<typeof verifyEmailSchema>,
  ): Promise<{ emailVerified: boolean }> {
    const user = await this.auth.verifyEmail(body.token);
    return { emailVerified: user.emailVerified };
  }

  @Post('email/verify/resend')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard)
  async resendVerification(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.rateLimit.consume('resendVerification', request.user.sub);
    await this.auth.resendVerification(request.user.sub);
  }

  /** 202 whether or not the address exists: no account enumeration. */
  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgotPassword(
    @Req() request: Request,
    @Body(new ZodValidationPipe(forgotSchema)) body: z.infer<typeof forgotSchema>,
  ): Promise<void> {
    await this.rateLimit.consume('forgotPassword', clientIp(request));
    await this.rateLimit.consume('forgotPassword', body.email);
    await this.auth.requestPasswordReset(body.email);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(
    @Body(new ZodValidationPipe(resetSchema)) body: z.infer<typeof resetSchema>,
  ): Promise<void> {
    await this.auth.resetPassword(body.token, body.password);
  }
}
