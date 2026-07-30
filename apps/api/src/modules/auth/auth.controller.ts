import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion client' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.motdepasse);
    return this.authService.login(user);
  }

  @Post('login-admin')
  @ApiOperation({ summary: 'Connexion administrateur (back-office)' })
  async loginAdmin(@Body() loginDto: LoginDto) {
    const admin = await this.authService.validateAdmin(loginDto.email, loginDto.motdepasse);
    return this.authService.loginAdmin(admin);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('profile')
  @ApiOperation({ summary: 'Profil utilisateur connecté' })
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Vérifier le code OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Renvoyer le code OTP' })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.email);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rafraîchir les tokens' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Déconnexion' })
  async logout(@Request() req: ExpressRequest) {
    const user = req.user as { sub: number };
    return this.authService.logout(user.sub);
  }
}