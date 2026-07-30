import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletsService } from '../wallet/wallet.service';
import { RedisService } from '../otp/redis.service';
import { MailService } from '../mail/mail.service';
import {
  CreatePinDto,
  ChangePinDto,
  ForgotPinDto,
  ResetPinDto,
  VerifyPinDto,
} from './dto/pin.dto';

const OTP_PREFIX = 'otp:wallet-pin-reset';
const OTP_TTL_SECONDS = 5 * 60;
const MAX_FAILED_PIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function otpKey(userId: number, walletId: string): string {
  return `${OTP_PREFIX}:${userId}:${walletId}`;
}

@Injectable()
export class PinService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly walletsService: WalletsService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  
  async getPinStatus(id: string, userId: number): Promise<{ hasPin: boolean }> {
    const wallet = await this.walletRepo.findOne({
      where: { id },
      select: ['id', 'userId', 'pinHash'],
    });
    if (!wallet) {
      throw new NotFoundException('Wallet introuvable');
    }
    this.walletsService.assertOwnership(wallet, userId);
    return { hasPin: !!wallet.pinHash };
  }

  // Première création du PIN (première ouverture du wallet).
  async createPin(id: string, userId: number, dto: CreatePinDto): Promise<void> {
    if (dto.pin !== dto.pinConfirmation) {
      throw new BadRequestException('Le PIN et sa confirmation ne correspondent pas');
    }

    await this.dataSource.transaction(async (manager) => {
      const wallet = await this.walletsService.lockWalletForUpdate(manager, id, true);
      this.walletsService.assertOwnership(wallet, userId);

      if (wallet.pinHash) {
        throw new ConflictException(
          'Un PIN existe déjà pour ce wallet. Utilisez le changement de PIN.',
        );
      }

      const pinHash = await argon2.hash(dto.pin);
      await manager.update(Wallet, { id }, { pinHash, pinCreatedAt: new Date() });
    });
  }

  // Changement volontaire (Paramètres > Sécurité > Modifier le PIN).
  async changePin(id: string, userId: number, dto: ChangePinDto): Promise<void> {
    if (dto.newPin !== dto.newPinConfirmation) {
      throw new BadRequestException('Le nouveau PIN et sa confirmation ne correspondent pas');
    }
    if (dto.newPin === dto.oldPin) {
      throw new BadRequestException("Le nouveau PIN doit être différent de l'ancien");
    }

    await this.dataSource.transaction(async (manager) => {
      await this.verifyPinWithManager(manager, id, userId, dto.oldPin);

      const newPinHash = await argon2.hash(dto.newPin);
      await manager.update(Wallet, { id }, { pinHash: newPinHash, pinCreatedAt: new Date() });
    });
  }

  // Déclenche l'envoi d'un OTP pour permettre un reset de PIN sans connaître l'ancien.

  async requestPinReset(id: string, userId: number, _dto: ForgotPinDto): Promise<void> {
    const wallet = await this.walletRepo.findOne({
      where: { id },
      relations: ['user'],
     
    });
    if (!wallet) {
      throw new NotFoundException('Wallet introuvable');
    }
    this.walletsService.assertOwnership(wallet, userId);

   
    if ((wallet.user as any).kycVerified === false) {
      throw new ForbiddenException(
        'Vérification KYC requise avant de pouvoir réinitialiser le PIN',
      );
    }

    const otpCode = generateOtp();
    await this.redisService.set(otpKey(userId, id), otpCode, OTP_TTL_SECONDS);
    await this.mailService.sendOtp(wallet.user.email, otpCode);

    // Note: dto.channel ('sms'|'email') n'est pas encore exploité — seul  l'email est câblé pour l'instant.
  }

  async resetPin(id: string, userId: number, dto: ResetPinDto): Promise<void> {
    if (dto.newPin !== dto.newPinConfirmation) {
      throw new BadRequestException('Le nouveau PIN et sa confirmation ne correspondent pas');
    }

    const wallet = await this.walletsService.findOne(id, userId);

    const key = otpKey(userId, id);
    const storedOtp = await this.redisService.get(key);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new ForbiddenException('Code OTP invalide ou expiré');
    }
    await this.redisService.del(key);

    const pinHash = await argon2.hash(dto.newPin);
    await this.walletRepo.update(
      { id: wallet.id },
      {
        pinHash,
        pinCreatedAt: new Date(),
        failedPinAttempts: 0,
        lockedUntil: null,
      },
    );
  }

  async verifyPin(id: string, userId: number, dto: VerifyPinDto): Promise<{ valid: true }> {
    await this.dataSource.transaction((manager) =>
      this.verifyPinWithManager(manager, id, userId, dto.pin),
    );
    return { valid: true };
  }


  async verifyPinWithManager(
    manager: EntityManager,
    id: string,
    userId: number,
    pin: string,
  ): Promise<Wallet> {
    const wallet = await this.walletsService.lockWalletForUpdate(manager, id, true);
    this.walletsService.assertOwnership(wallet, userId);

    if (!wallet.pinHash) {
      throw new BadRequestException(
        'Aucun PIN configuré : ouvrez votre portefeuille pour en créer un',
      );
    }

    if (wallet.lockedUntil && wallet.lockedUntil.getTime() > Date.now()) {
      const remainingMinutes = Math.ceil((wallet.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(
        `Wallet temporairement verrouillé. Réessayez dans ${remainingMinutes} minute(s).`,
      );
    }

    const isValid = await argon2.verify(wallet.pinHash, pin);

    if (!isValid) {
      const attempts = wallet.failedPinAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED_PIN_ATTEMPTS;

      await manager.update(Wallet, { id }, {
        failedPinAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      });

      if (shouldLock) {
        throw new ForbiddenException(
          `Trop de tentatives échouées. Wallet verrouillé pendant 15 minutes.`,
        );
      }
      throw new ForbiddenException('PIN incorrect');
    }

    // Succès : on réinitialise le compteur et le verrou éventuel.
    if (wallet.failedPinAttempts !== 0 || wallet.lockedUntil) {
      await manager.update(Wallet, { id }, { failedPinAttempts: 0, lockedUntil: null });
    }

    return wallet;
  }
}