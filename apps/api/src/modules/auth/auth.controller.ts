import { Controller, Post, Body, UseGuards, Request, Get, Req, Res, Param } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dto/create-user.dto';

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
  async getProfile(@Request() req: ExpressRequest) {
    const user = req.user as { sub: number; email: string; role?: string };
    if (user.role === 'admin') {
      const admin = await this.authService.getAdminProfile(user.sub);
      return { ...admin, role: 'admin' };
    }
    return this.authService.getUserProfile(user.sub);
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

  @Post('logout')
  @ApiOperation({ summary: 'Déconnexion' })
  async logout(@Request() req: ExpressRequest) {
    const user = req.user as { sub?: number } | undefined;
    if (user?.sub) {
      await this.authService.logout(user.sub);
    }
    return { message: 'Déconnexion réussie' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initier la connexion Google OAuth' })
  googleAuth() {
    // Passport redirige automatiquement vers Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback Google OAuth' })
  async googleAuthCallback(@Req() req: ExpressRequest, @Res() res: Response) {
  const googleUser = req.user as {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };

  const frontendUrl = process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:5173';

  const existingUser = await this.authService.resolveGoogleUser(googleUser.googleId, googleUser.email);

  if (existingUser) {
    if (!existingUser.verificationotp) {
      // Compte trouvé mais jamais vérifié (ex: inscription classique jamais finalisée)
      await this.authService.resendOtp(existingUser.email);
      const params = new URLSearchParams({ email: existingUser.email });
      return res.redirect(`${frontendUrl}/verify-otp?${params.toString()}`);
    }

    // Compte existant et vérifié → connexion directe → dashboard
    const tokens = await this.authService.login({
      idutilisateur: existingUser.idutilisateur,
      email: existingUser.email,
    });
    const params = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    return res.redirect(`${frontendUrl}/auth/callback#${params.toString()}`);
  }

  // Nouveau compte → on garde le profil Google en attente, le front complète le formulaire
  const token = await this.authService.createGooglePendingSignup({
    googleId: googleUser.googleId,
    email: googleUser.email,
    prenom: googleUser.firstName || '',
    nom: googleUser.lastName || '',
  });

  return res.redirect(`${frontendUrl}/signup?token=${token}`);
}

@Get('google/pending/:token')
@ApiOperation({ summary: "Récupérer le profil Google en attente pour préremplir l'inscription" })
async getGooglePending(@Param('token') token: string) {
  const pending = await this.authService.getGooglePendingSignup(token);
  // On ne renvoie jamais le googleId au client
  return { email: pending.email, nom: pending.nom, prenom: pending.prenom };
}

@Post('google/complete-signup/:token')
@ApiOperation({ summary: "Finaliser l'inscription après connexion Google" })
async completeGoogleSignup(
  @Param('token') token: string,
  @Body() dto: CreateUserDto,
) {
  return this.authService.completeGoogleSignup(token, dto);
}
}