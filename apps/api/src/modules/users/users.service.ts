import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { hash, verify } from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../otp/redis.service';
import { MailService } from '../mail/mail.service';
import { WalletsService } from '../wallet/wallet.service';
import { WalletStatus } from '../wallet/entities/wallet.entity';

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
    private readonly dataSource: DataSource,
    private readonly walletsService: WalletsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, telephone, motdepasse, datenaissance, profession, ...rest } = createUserDto;

    // Vérifier que l'email ou le téléphone n'existe pas
    const existing = await this.usersRepository.findOne({
      where: [{ email }, { telephone }],
    });

    if (existing) {
      throw new ConflictException('Email ou téléphone déjà utilisé.');
    }

    // Vérifier que le mot de passe est fourni (sauf pour Google)
    if (!motdepasse && !createUserDto.googleId) {
      throw new ConflictException('Le mot de passe est obligatoire.');
    }

    // Transaction atomique : user + wallet + OTP échouent ou réussissent ensemble
    const savedUser = await this.dataSource.transaction(async (manager) => {
      const hashedPassword = motdepasse ? await hash(motdepasse) : '';

      const user = manager.create(User, {
        ...rest,
        email,
        telephone,
        profession,
        datenaissance: new Date(datenaissance),
        motdepasse: hashedPassword,
        verificationotp: false,
      });

      const saved = await manager.save(user);

      // Créer un wallet par défaut avec statut INACTIVE
      await this.walletsService.create(
        saved.idutilisateur,
        { currency: 'XAF' },
        manager,
        WalletStatus.INACTIVE,
      );

      // OTP systématique
      const otpCode = generateOtp();
      await this.redisService.set(`otp:email:${email}`, otpCode, 3 * 60);
      await this.mailService.sendOtp(email, otpCode);

      return saved;
    });

    return savedUser;
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
