import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { Administrateur, AdministrateurStatut } from '../../role/entities/administrateur.entity';
import { UserStatut } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(Administrateur)
    private readonly adminRepo: Repository<Administrateur>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.accessSecret'),
    });
  }

  async validate(payload: { sub: number; email: string; role?: string }) {
    this.logger.debug(
      `JWT validate — id: ${payload.sub}, email: ${payload.email}, role: ${payload.role ?? '(none)'}`,
    );

    if (payload.role === 'admin') {
      const admin = await this.adminRepo.findOne({
        where: { id: payload.sub },
        select: ['id', 'nom', 'email', 'statut'],
      });
      if (!admin) {
        this.logger.warn(`Admin not found — id: ${payload.sub}`);
        throw new UnauthorizedException('Administrateur introuvable');
      }
      // Une suspension prend effet a la requete suivante, sans attendre
      // l'expiration du jeton d'acces.
      if (admin.statut !== AdministrateurStatut.ACTIF) {
        throw new ForbiddenException('Compte administrateur suspendu');
      }
      return { id: admin.id, sub: admin.id, email: admin.email, role: 'admin' };
    }

    let user: Awaited<ReturnType<typeof this.usersService.findOne>>;
    try {
      user = await this.usersService.findOne(payload.sub);
    } catch (err) {
      this.logger.warn(
        `User not found for sub: ${payload.sub} — ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    // Idem cote client : un compte suspendu, bloque ou ferme perd l'acces des
    // la requete suivante, meme si son jeton est encore valide.
    if (user.statut !== UserStatut.ACTIF) {
      throw new ForbiddenException(
        user.statut === UserStatut.FERME
          ? 'Ce compte a été fermé.'
          : 'Votre compte est suspendu. Veuillez contacter le support.',
      );
    }

    return {
      id: user.idutilisateur,
      sub: user.idutilisateur,
      email: user.email,
      role: payload.role,
    };
  }
}
