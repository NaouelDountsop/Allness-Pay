import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { verify } from 'argon2';
import { UsersService } from '../users/users.service';
import { RedisService } from '../otp/redis.service';
import { Administrateur, AdministrateurStatut } from '../role/entities/administrateur.entity';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @InjectRepository(Administrateur)
    private readonly adminRepo: Repository<Administrateur>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  async validateAdmin(email: string, motdepasse: string): Promise<Administrateur> {
    const admin = await this.adminRepo.findOne({
      where: { email },
      select: ['id', 'nom', 'email', 'motdepasse', 'statut'],
    });
    if (!admin) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    if (admin.statut !== AdministrateurStatut.ACTIF) {
      throw new ForbiddenException('Compte administrateur suspendu');
    }

    const valid = await verify(admin.motdepasse, motdepasse);
    if (!valid) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    return admin;
  }

  async loginAdmin(admin: { id: number; email: string }) {
    return this.issueAdminTokens(admin);
  }

  private async issueAdminTokens(admin: { id: number; email: string }) {
    const payload = { sub: admin.id, email: admin.email, role: 'admin' };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: this.parseTtlToSeconds(process.env.JWT_ACCESS_TTL ?? '15m'),
    });

    const jti = randomUUID();
    const refresh_token = this.jwtService.sign(
      { sub: admin.id, jti, role: 'admin' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: this.parseTtlToSeconds(process.env.JWT_REFRESH_TTL ?? '30d'),
      },
    );

    const ttlSeconds = this.parseTtlToSeconds(process.env.JWT_REFRESH_TTL ?? '30d');
    await this.redisService.set(`refresh:admin:${admin.id}`, jti, ttlSeconds);

    return { access_token, refresh_token };
  }

  private async issueTokens(user: { idutilisateur: number; email: string }) {
    const payload = { sub: user.idutilisateur, email: user.email };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: this.parseTtlToSeconds(process.env.JWT_ACCESS_TTL ?? '15m'),
    });

    const jti = randomUUID();
    const refresh_token = this.jwtService.sign(
      { sub: user.idutilisateur, jti },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: this.parseTtlToSeconds(process.env.JWT_REFRESH_TTL ?? '30d'),
      },
    );

    const ttlSeconds = this.parseTtlToSeconds(process.env.JWT_REFRESH_TTL ?? '30d');
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
    if (!match) return 30 * 24 * 60 * 60;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
  }



  // Cherche un compte lié à ce googleId, sinon par email (et lie le googleId si trouvé par email)
async resolveGoogleUser(googleId: string, email: string): Promise<User | null> {
  let user = await this.userRepo.findOne({ where: { googleId } });
  if (user) return user;

  user = await this.userRepo.findOne({ where: { email } });
  if (user) {
    user.googleId = googleId;
    await this.userRepo.save(user);
    return user;
  }

  return null;
}

// Stocke le profil Google vérifié en attendant que l'utilisateur complète le formulaire
async createGooglePendingSignup(profile: {
  googleId: string;
  email: string;
  prenom: string;
  nom: string;
}): Promise<string> {
  const token = randomUUID();
  await this.redisService.set(`google_pending:${token}`, JSON.stringify(profile), 15 * 60);
  return token;
}

// Relit le profil en attente (utilisé par le front pour préremplir le formulaire)
async getGooglePendingSignup(token: string) {
  const raw = await this.redisService.get(`google_pending:${token}`);
  if (!raw) {
    throw new UnauthorizedException("Session d'inscription Google expirée, veuillez recommencer.");
  }
  return JSON.parse(raw) as { googleId: string; email: string; prenom: string; nom: string };
}

// Finalise l'inscription : fusionne le profil Google + le formulaire, crée le user, envoie l'OTP
async completeGoogleSignup(token: string, dto: CreateUserDto) {
  const pending = await this.getGooglePendingSignup(token);

  const user = await this.usersService.create({
    nom: pending.nom,
    prenom: pending.prenom,
    email: pending.email,
    googleId: pending.googleId,
    datenaissance: dto.datenaissance,
    sexe: dto.sexe,
    pays: dto.pays,
    ville: dto.ville,
    telephone: dto.telephone,
    adresse: dto.adresse,
    profession: dto.profession,
    motdepasse: dto.motdepasse,
  });

  await this.redisService.del(`google_pending:${token}`);

  return {
    message: 'Compte créé. Un code de vérification a été envoyé à votre email.',
    email: user.email,
  };
}
}
