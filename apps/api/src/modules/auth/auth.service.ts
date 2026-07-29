import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { RedisService } from '../otp/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(email: string, motdepasse: string) {
    const user = await this.usersService.validateUser(email, motdepasse);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }
    if (!user.verificationotp) {
      throw new UnauthorizedException("Compte non vérifié. Veuillez valider l'OTP reçu par email.");
    }
    return user;
  }

  async login(user: { idutilisateur: number; email: string }) {
    return this.issueTokens(user);
  }

  // Génère un access + refresh token, stocke le refresh token en Redis
  private async issueTokens(user: { idutilisateur: number; email: string }) {
    const payload = { sub: user.idutilisateur, email: user.email };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: this.parseTtlToSeconds(process.env.JWT_ACCESS_TTL ?? '15m'),
    });

    // jti = identifiant unique du refresh token, utile pour la révocation ciblée
    const jti = randomUUID();
    const refresh_token = this.jwtService.sign(
      { sub: user.idutilisateur, jti },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: this.parseTtlToSeconds(process.env.JWT_REFRESH_TTL ?? '30d'),
      },
    );

    const ttlSeconds = this.parseTtlToSeconds(process.env.JWT_REFRESH_TTL ?? '30d');
    // On stocke le jti courant : un seul refresh token valide à la fois par utilisateur
    await this.redisService.set(`refresh:${user.idutilisateur}`, jti, ttlSeconds);

    return { access_token, refresh_token };
  }

  async refresh(refreshToken: string) {
    let decoded: { sub: number; jti: string };
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }

    const storedJti = await this.redisService.get(`refresh:${decoded.sub}`);
    if (!storedJti || storedJti !== decoded.jti) {
      throw new UnauthorizedException('Refresh token invalide ou révoqué.');
    }

    const user = await this.usersService.findOne(decoded.sub);

    // Rotation : on invalide l'ancien et on émet une nouvelle paire
    return this.issueTokens({ idutilisateur: user.idutilisateur, email: user.email });
  }

  async logout(userId: number) {
    await this.redisService.del(`refresh:${userId}`);
    return { message: 'Déconnecté avec succès.' };
  }

  async verifyOtp(email: string, otp: string) {
    return this.usersService.verifyOtp(email, otp);
  }

  async resendOtp(email: string) {
    return this.usersService.resendOtp(email);
  }

  private parseTtlToSeconds(ttl: string): number {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) return 30 * 24 * 60 * 60; // fallback 30 jours
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
  }

}