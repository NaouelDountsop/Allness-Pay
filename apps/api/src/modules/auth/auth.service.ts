import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, motdepasse: string) {
    const user = await this.usersService.validateUser(email, motdepasse);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    if (!user.verificationotp) {
      throw new UnauthorizedException('Compte non vérifié. Veuillez valider l OTP reçu par email.');
    }

    return user;
  }

  async login(user: { idutilisateur: number; email: string }) {
    const payload = { sub: user.idutilisateur, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyOtp(email: string, otp: string) {
    return this.usersService.verifyOtp(email, otp);
  }

  async resendOtp(email: string) {
    return this.usersService.resendOtp(email);
  }
}
