import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../../modules/otp/redis.service';
import { Administrateur, AdministrateurStatut } from '../role/entities/administrateur.entity';
import { User, UserStatut } from '../users/entities/user.entity';

/**
 * Verrouille les quatre correctifs de securite appliques au module d'auth.
 *
 * Chaque test correspond a une regression precise : si l'un d'eux repasse au
 * rouge, c'est qu'une faille refermee vient d'etre rouverte.
 */
describe('AuthService — correctifs de securite', () => {
  let service: AuthService;
  let usersService: { validateUser: jest.Mock; findOne: jest.Mock };
  let redis: { set: jest.Mock; get: jest.Mock; del: jest.Mock };
  let adminRepo: { findOne: jest.Mock; save: jest.Mock };

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      idutilisateur: 1,
      email: 'client@exemple.cm',
      verificationotp: true,
      statut: UserStatut.ACTIF,
      ...overrides,
    }) as User;

  beforeEach(async () => {
    usersService = { validateUser: jest.fn(), findOne: jest.fn() };
    redis = { set: jest.fn(), get: jest.fn(), del: jest.fn() };
    adminRepo = { findOne: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'jeton'), verify: jest.fn() } },
        { provide: RedisService, useValue: redis },
        { provide: getRepositoryToken(Administrateur), useValue: adminRepo },
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn(), save: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // --- Correctif 4 : le statut du compte est controle a la connexion ---------
  describe('validateUser — statut du compte', () => {
    it('accepte un compte ACTIF et verifie', async () => {
      usersService.validateUser.mockResolvedValue(buildUser());

      await expect(service.validateUser('client@exemple.cm', 'secret')).resolves.toBeDefined();
    });

    it.each([UserStatut.SUSPENDU, UserStatut.BLOQUE, UserStatut.FERME])(
      'refuse un compte %s meme avec le bon mot de passe',
      async (statut) => {
        usersService.validateUser.mockResolvedValue(buildUser({ statut }));

        await expect(service.validateUser('client@exemple.cm', 'secret')).rejects.toThrow(
          ForbiddenException,
        );
      },
    );

    it('refuse toujours un compte non verifie par OTP', async () => {
      usersService.validateUser.mockResolvedValue(buildUser({ verificationotp: false }));

      await expect(service.validateUser('client@exemple.cm', 'secret')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // --- Correctif 2 : plus aucune comparaison de mot de passe en clair --------
  describe('validateAdmin — empreinte du mot de passe', () => {
    it('refuse un mot de passe stocke en clair, meme si la valeur correspond', async () => {
      adminRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'admin@exemple.cm',
        // Valeur en clair : `argon2.verify` leve, l'ancien code repliait sur
        // une comparaison litterale et laissait passer.
        motdepasse: 'motdepasseEnClair',
        statut: AdministrateurStatut.ACTIF,
      });

      await expect(service.validateAdmin('admin@exemple.cm', 'motdepasseEnClair')).rejects.toThrow(
        UnauthorizedException,
      );
      // Et surtout : aucun rehachage silencieux du mot de passe en clair.
      expect(adminRepo.save).not.toHaveBeenCalled();
    });

    it('refuse un administrateur suspendu', async () => {
      adminRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'admin@exemple.cm',
        motdepasse: 'peu importe',
        statut: AdministrateurStatut.SUSPENDU,
      });

      await expect(service.validateAdmin('admin@exemple.cm', 'secret')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // --- Correctifs 1 et 3 : espaces de noms des jetons de rafraichissement ----
  describe('logout — revocation effective', () => {
    it('revoque le jeton du client dans son espace de noms', async () => {
      await service.logout(7);

      expect(redis.del).toHaveBeenCalledWith('refresh:7');
    });

    it("revoque le jeton de l'administrateur dans l'espace de noms administrateur", async () => {
      await service.logout(7, 'admin');

      // L'admin n°7 n'est pas le client n°7 : sans cette separation, la
      // deconnexion d'un admin ne revoquait rien.
      expect(redis.del).toHaveBeenCalledWith('refresh:admin:7');
    });
  });

  describe('refresh — coherence des espaces de noms', () => {
    it('lit la cle administrateur pour un jeton administrateur', async () => {
      const jwt = service['jwtService'] as unknown as { verify: jest.Mock };
      jwt.verify.mockReturnValue({ sub: 7, jti: 'abc', role: 'admin' });
      redis.get.mockResolvedValue('abc');
      adminRepo.findOne.mockResolvedValue({
        id: 7,
        email: 'admin@exemple.cm',
        statut: AdministrateurStatut.ACTIF,
      });

      await service.refresh('jeton-admin');

      expect(redis.get).toHaveBeenCalledWith('refresh:admin:7');
      // Le rafraichissement administrateur ne doit jamais passer par le
      // referentiel des clients.
      expect(usersService.findOne).not.toHaveBeenCalled();
    });

    it('lit la cle client pour un jeton client', async () => {
      const jwt = service['jwtService'] as unknown as { verify: jest.Mock };
      jwt.verify.mockReturnValue({ sub: 7, jti: 'abc' });
      redis.get.mockResolvedValue('abc');
      usersService.findOne.mockResolvedValue(buildUser({ idutilisateur: 7 }));

      await service.refresh('jeton-client');

      expect(redis.get).toHaveBeenCalledWith('refresh:7');
    });

    it("refuse de prolonger la session d'un compte suspendu", async () => {
      const jwt = service['jwtService'] as unknown as { verify: jest.Mock };
      jwt.verify.mockReturnValue({ sub: 7, jti: 'abc' });
      redis.get.mockResolvedValue('abc');
      usersService.findOne.mockResolvedValue(
        buildUser({ idutilisateur: 7, statut: UserStatut.SUSPENDU }),
      );

      await expect(service.refresh('jeton-client')).rejects.toThrow(ForbiddenException);
    });

    it('refuse un jeton dont le jti ne correspond plus (rotation)', async () => {
      const jwt = service['jwtService'] as unknown as { verify: jest.Mock };
      jwt.verify.mockReturnValue({ sub: 7, jti: 'ancien' });
      redis.get.mockResolvedValue('nouveau');

      await expect(service.refresh('jeton-perime')).rejects.toThrow(UnauthorizedException);
    });
  });
});
