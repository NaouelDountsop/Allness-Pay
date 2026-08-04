
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LinkedAccount } from './entities/linked-account.entity';
import { CreateLinkedAccountDto } from './dto/create-linked-account.dto';
import { UpdateLinkedAccountDto } from './dto/update-linked-account.dto';
import { LinkedAccountStatus } from './enums/linked-account-status.enum';
import { LinkedAccountType } from './enums/linked-account-type.enum';
import { RedisService } from '../otp/redis.service';
import { Wallet } from '../wallet/entities/wallet.entity';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class LinkedAccountsService {
  constructor(
    @InjectRepository(LinkedAccount)
    private readonly linkedAccountRepo: Repository<LinkedAccount>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async create(userId: number, dto: CreateLinkedAccountDto): Promise<LinkedAccount> {
    const wallet = await this.walletRepo.findOne({ where: { id: dto.walletId } });
    if (!wallet) {
      throw new NotFoundException('Wallet introuvable.');
    }
    if (wallet.userId !== userId) {
      throw new ForbiddenException('Ce wallet ne vous appartient pas.');
    }

    if (dto.type === LinkedAccountType.MOBILE_MONEY && !dto.phoneNumber) {
      throw new BadRequestException('Le numéro de téléphone est obligatoire pour un compte Mobile Money.');
    }

    if (dto.type === LinkedAccountType.BANK_ACCOUNT && !dto.accountNumber) {
      throw new BadRequestException('Le numéro de compte est obligatoire pour un compte bancaire.');
    }

    const existing = await this.linkedAccountRepo.findOne({
      where: { userId, phoneNumber: dto.phoneNumber, status: LinkedAccountStatus.ACTIVE },
    });

    if (existing) {
      throw new ConflictException('Ce numéro de téléphone est déjà lié à un compte actif.');
    }

    const defaultCount = await this.linkedAccountRepo.count({ where: { userId } });

    const account = this.linkedAccountRepo.create({
      ...dto,
      userId,
      isDefault: defaultCount === 0,
      status: LinkedAccountStatus.PENDING,
    });

    const saved = await this.linkedAccountRepo.save(account);

    await this.sendVerificationCode(saved);

    return saved;
  }

  async findAllForUser(userId: number): Promise<LinkedAccount[]> {
    return this.linkedAccountRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: number): Promise<LinkedAccount> {
    const account = await this.linkedAccountRepo.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException('Compte lié introuvable.');
    }
    this.assertOwnership(account, userId);
    return account;
  }

  async update(id: string, userId: number, dto: UpdateLinkedAccountDto): Promise<LinkedAccount> {
    const account = await this.findOne(id, userId);

    if (account.status === LinkedAccountStatus.ACTIVE && dto.phoneNumber) {
      throw new BadRequestException('Impossible de modifier le numéro d\'un compte vérifié.');
    }

    Object.assign(account, dto);
    return this.linkedAccountRepo.save(account);
  }

  async setDefault(id: string, userId: number): Promise<LinkedAccount> {
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(LinkedAccount, { where: { id } });
      if (!account) {
        throw new NotFoundException('Compte lié introuvable.');
      }
      this.assertOwnership(account, userId);

      if (account.status !== LinkedAccountStatus.ACTIVE) {
        throw new BadRequestException('Seul un compte vérifié peut devenir par défaut.');
      }

      await manager.update(LinkedAccount, { userId, isDefault: true }, { isDefault: false });
      account.isDefault = true;
      return manager.save(account);
    });
  }

  async verify(id: string, userId: number, code: string): Promise<LinkedAccount> {
    const account = await this.findOne(id, userId);

    if (account.status === LinkedAccountStatus.ACTIVE) {
      throw new BadRequestException('Ce compte est déjà vérifié.');
    }

    if (account.lockedUntil && account.lockedUntil > new Date()) {
      throw new BadRequestException('Compte temporairement verrouillé. Réessayez plus tard.');
    }

    const storedCode = await this.redisService.get(`linked_account:verify:${id}`);
    if (!storedCode || storedCode !== code) {
      account.failedVerificationAttempts += 1;

      if (account.failedVerificationAttempts >= 5) {
        account.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await this.linkedAccountRepo.save(account);
      throw new ConflictException('Code de vérification invalide ou expiré.');
    }

    account.status = LinkedAccountStatus.ACTIVE;
    account.verifiedAt = new Date();
    account.verificationToken = null;
    account.failedVerificationAttempts = 0;

    await this.redisService.del(`linked_account:verify:${id}`);
    return this.linkedAccountRepo.save(account);
  }

  async remove(id: string, userId: number): Promise<void> {
    const account = await this.findOne(id, userId);

    if (account.isDefault) {
      throw new BadRequestException('Impossible de supprimer le compte par défaut. Définissez un autre compte par défaut.');
    }

    await this.linkedAccountRepo.remove(account);
  }

  async sendVerificationCode(account: LinkedAccount): Promise<void> {
    const code = generateVerificationCode();
    await this.redisService.set(`linked_account:verify:${account.id}`, code, 5 * 60);

    if (account.phoneNumber) {
      // TODO: Envoyer SMS via provider (Twilio, Africa's Talking, etc.)
      // Pour l'instant, on log le code pour le développement
      //console.log(`[DEV] Code de vérification pour ${account.phoneNumber}: ${code}`);
    }

    if (account.type === LinkedAccountType.BANK_ACCOUNT) {
      // TODO: Envoyer email avec code de vérification
      //console.log(`[DEV] Code de vérification pour le compte bancaire ${account.id}: ${code}`);
    }
  }

  private assertOwnership(account: LinkedAccount, userId: number): void {
    if (account.userId !== userId) {
      throw new ForbiddenException('Ce compte ne vous appartient pas.');
    }
  }
}