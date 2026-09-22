import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions/business.exception';
import { Repository, DataSource } from 'typeorm';
import { hash, verify } from 'argon2';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../otp/redis.service';
import { MailService } from '../mail/mail.service';
import { WalletsService } from '../wallet/wallet.service';
import { getCurrencyByCountry } from '../../config/country-currency.config';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly walletsService: WalletsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, telephone, motdepasse, datenaissance, profession, googleId, pays, ...rest } =
      createUserDto;

    const existingByEmail = await this.usersRepository.findOne({ where: { email } });
    if (existingByEmail) {
      throw new ConflictException({
        code: 'DUPLICATE_EMAIL',
        message: 'Cet email est déjà utilisé par un autre compte.',
        field: 'email',
      });
    }

    const existingByPhone = await this.usersRepository.findOne({ where: { telephone } });
    if (existingByPhone) {
      throw new ConflictException({
        code: 'DUPLICATE_PHONE',
        message: 'Ce numéro de téléphone est déjà utilisé par un autre compte.',
        field: 'telephone',
      });
    }

    if (googleId) {
      const existingByGoogle = await this.usersRepository.findOne({ where: { googleId } });
      if (existingByGoogle) {
        throw new ConflictException({
          code: 'DUPLICATE_GOOGLE',
          message: 'Ce compte Google est déjà associé à un compte AllnessPay.',
          field: 'googleId',
        });
      }
    }

    const hashedPassword = motdepasse ? await hash(motdepasse) : await hash(randomUUID());

    // Transaction atomique : user + wallet échouent ou réussissent ensemble
    const savedUser = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        ...rest,
        email,
        telephone,
        pays,
        profession,
        datenaissance: new Date(datenaissance),
        motdepasse: hashedPassword,
        verificationotp: false,
      });

      const saved = await manager.save(user);

      // Création du wallet principal selon le pays (même transaction)
      const currency = getCurrencyByCountry(pays);
      await this.walletsService.create(saved.idutilisateur, { currency }, manager);

      return saved;
    });

    // OTP en dehors de la transaction (Redis + email, pas critique)
    const otpCode = generateOtp();
    await this.redisService.set(`otp:email:${email}`, otpCode, 3 * 60);
    await this.mailService.sendOtp(email, otpCode);

    return savedUser;
  }

  /**
   * Nomme precisement le ou les champs deja pris.
   *
   * Le message generique precedent (« Email, telephone ou compte Google deja
   * utilise ») laissait l'utilisateur deviner quel champ corriger. `details.champs`
   * permet en plus au formulaire de surligner directement les bons champs.
   *
   * Contrepartie assumee : un message precis confirme l'existence d'un compte
   * pour une adresse donnee. C'est l'usage courant sur une inscription, ou
   * l'alternative rend le formulaire impraticable.
   */
  private assertNoConflict(
    conflits: User[],
    saisie: { email: string; telephone: string; googleId?: string },
  ): never | void {
    const champs: string[] = [];
    if (conflits.some((u) => u.email === saisie.email)) champs.push('email');
    if (conflits.some((u) => u.telephone === saisie.telephone)) champs.push('telephone');
    if (saisie.googleId && conflits.some((u) => u.googleId === saisie.googleId)) {
      champs.push('googleId');
    }

    const libelles: Record<string, string> = {
      email: 'Cette adresse e-mail est déjà associée à un compte.',
      telephone: 'Ce numéro de téléphone est déjà associé à un compte.',
      googleId: 'Ce compte Google est déjà lié à un utilisateur.',
    };

    const message =
      champs.length === 0
        ? // Cas theorique : une ligne remonte sans qu'aucun champ ne corresponde
          // (comparaison sensible a la casse, par exemple). On reste explicite
          // plutot que de laisser passer une creation qui violerait la contrainte.
          'Ces informations sont déjà associées à un compte.'
        : champs.map((champ) => libelles[champ]).join(' ');

    throw new BusinessException('DUPLICATE_RESOURCE', message, HttpStatus.CONFLICT, { champs });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { idutilisateur: id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (updateUserDto.motdepasse) {
      updateUserDto.motdepasse = await hash(updateUserDto.motdepasse);
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.motdepasse')
      .where('user.email = :email', { email })
      .getOne();
    if (!user) return null;

    const valid = await verify(user.motdepasse, password);
    return valid ? user : null;
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const storedOtp = await this.redisService.get(`otp:email:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new ConflictException('Code OTP invalide ou expiré.');
    }

    user.verificationotp = true;
    await this.redisService.del(`otp:email:${email}`);
    return this.usersRepository.save(user);
  }

  async resendOtp(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const otpCode = generateOtp();
    await this.redisService.set(`otp:email:${email}`, otpCode, 10 * 60);

    await this.mailService.sendOtp(email, otpCode);

    return { message: 'OTP renvoyé, vérifiez votre email.' };
  }
}
