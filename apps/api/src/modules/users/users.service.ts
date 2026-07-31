import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hash, verify } from 'argon2';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../otp/redis.service';
import { MailService } from '../mail/mail.service';

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
  ) {}

  async create(createUserDto: CreateUserDto) {
  const { email, telephone, motdepasse, datenaissance, profession, googleId, ...rest } = createUserDto;

  const existing = await this.usersRepository.findOne({
    where: [
      { email },
      { telephone },
      ...(googleId ? [{ googleId }] : []),
    ],
  });

  if (existing) {
    throw new ConflictException('Email, téléphone ou compte Google déjà utilisé.');
  }

  const hashedPassword = motdepasse ? await hash(motdepasse) : await hash(randomUUID());

  const user = this.usersRepository.create({
    ...rest,
    email,
    telephone,
    profession,
    datenaissance: new Date(datenaissance),
    motdepasse: hashedPassword,
    verificationotp: false, // toujours false à la création, Google ou pas
    googleId: googleId || undefined,
  });

  const saved = await this.usersRepository.save(user);

  // OTP systématique, y compris pour les comptes Google
  const otpCode = generateOtp();
  await this.redisService.set(`otp:email:${email}`, otpCode, 3 * 60);
  await this.mailService.sendOtp(email, otpCode);

  return saved;
}

  findAll() : Promise<User []> {
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
