import { HttpStatus } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { BusinessException } from '@/common/exceptions/business.exception';
import type { CreateUserDto } from './dto/create-user.dto';
import type { User } from './entities/user.entity';
import { UsersService } from './users.service';

/**
 * Verrouille la precision du conflit a l'inscription.
 *
 * Le message generique precedent obligeait l'utilisateur a deviner quel champ
 * corriger ; `details.champs` permet au formulaire de surligner le bon.
 */
describe('UsersService — conflit a la creation', () => {
  let service: UsersService;
  let repository: { find: jest.Mock };

  const dto = {
    nom: 'Ngo Bassong',
    prenom: 'Aissatou',
    datenaissance: '1998-04-12',
    sexe: 'F',
    pays: 'Cameroun',
    ville: 'Douala',
    telephone: '+237690000000',
    email: 'aissatou@exemple.cm',
    profession: 'Commercante',
    motdepasse: 'MotDePasseSolide1',
  } as unknown as CreateUserDto;

  const compte = (overrides: Partial<User> = {}): User =>
    ({
      idutilisateur: 1,
      email: 'autre@exemple.cm',
      telephone: '+237600000000',
      googleId: null,
      ...overrides,
    }) as User;

  /** Recupere l'exception levee, pour inspecter code / message / details. */
  const captureConflit = async (): Promise<BusinessException> => {
    try {
      await service.create(dto);
    } catch (error) {
      return error as BusinessException;
    }
    throw new Error('un conflit etait attendu');
  };

  beforeEach(() => {
    repository = { find: jest.fn() };
    service = new UsersService(
      repository as unknown as Repository<User>,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it("nomme l'adresse e-mail quand elle est deja prise", async () => {
    repository.find.mockResolvedValue([compte({ email: dto.email })]);

    const error = await captureConflit();

    expect(error).toBeInstanceOf(BusinessException);
    expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(error.code).toBe('DUPLICATE_RESOURCE');
    expect(error.message).toContain('adresse e-mail');
    expect(error.details).toEqual({ champs: ['email'] });
  });

  it('nomme le numero de telephone quand il est deja pris', async () => {
    repository.find.mockResolvedValue([compte({ telephone: dto.telephone })]);

    const error = await captureConflit();

    expect(error.message).toContain('numéro de téléphone');
    expect(error.details).toEqual({ champs: ['telephone'] });
  });

  it('signale les DEUX champs quand ils appartiennent a des comptes differents', async () => {
    repository.find.mockResolvedValue([
      compte({ idutilisateur: 1, email: dto.email }),
      compte({ idutilisateur: 2, telephone: dto.telephone }),
    ]);

    const error = await captureConflit();

    // Sans cela, l'utilisateur corrigeait l'e-mail pour buter aussitot sur le
    // telephone.
    expect(error.details).toEqual({ champs: ['email', 'telephone'] });
    expect(error.message).toContain('adresse e-mail');
    expect(error.message).toContain('numéro de téléphone');
  });

  it("signale le compte Google lorsqu'il est deja lie", async () => {
    repository.find.mockResolvedValue([compte({ googleId: 'g-123' })]);

    const error = await (async () => {
      try {
        await service.create({ ...dto, googleId: 'g-123' } as CreateUserDto);
      } catch (e) {
        return e as BusinessException;
      }
      throw new Error('un conflit etait attendu');
    })();

    expect(error.details).toEqual({ champs: ['googleId'] });
  });

  it("ne cherche pas de conflit Google quand aucun googleId n'est fourni", async () => {
    repository.find.mockResolvedValue([]);

    await service.create(dto).catch(() => undefined);

    const where = repository.find.mock.calls[0]![0].where as unknown[];
    // Deux criteres seulement : email et telephone.
    expect(where).toHaveLength(2);
  });
});
