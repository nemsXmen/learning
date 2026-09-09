import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { AUTH_ENTITIES } from './auth.entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';
import { EmailTokenService } from './email-token.service';
import { JwtAuthGuard } from './jwt.guard';
import { RateLimitService } from './rate-limit.service';
import { TokenService } from './token.service';

@Module({
  imports: [TypeOrmModule.forFeature(AUTH_ENTITIES), JwtModule.register({}), MailModule],
  controllers: [AuthController],
  providers: [AuthService, CryptoService, EmailTokenService, TokenService, RateLimitService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
