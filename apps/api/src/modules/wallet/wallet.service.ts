import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { randomBytes } from 'crypto';
import { Wallet, WalletStatus, WalletType } from './entities/wallet.entity';
import { Kyc, KycStatus } from '../kyc/entities/kyc.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Kyc)
    private readonly kycRepository: Repository<Kyc>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @param externalManager - Si fourni, réutilise la transaction existante
   *                          (appel depuis UsersService.create).
   */
  async create(
    userId: number,
    dto: CreateWalletDto,
    externalManager?: EntityManager,
  ): Promise<Wallet> {
    const run = async (manager: EntityManager) => {
      const existingWallets = await manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.userId = :userId', { userId })
        .getMany();

      const hasPersonal = existingWallets.some((w) => w.type === WalletType.PERSONAL);
      if (hasPersonal) {
        throw new ConflictException({
          code: 'WALLET_EXISTS',
          message: 'Vous ne pouvez avoir qu\'un seul portefeuille personnel.',
        });
      }

      const kyc = await manager.findOne(Kyc, { where: { userId } });
      const kycApproved = kyc?.status === KycStatus.APPROVED;

      const wallet = manager.create(Wallet, {
        userId,
        balance: '0',
        currency: dto.currency ?? 'XAF',
        status: kycApproved ? WalletStatus.ACTIVE : WalletStatus.INACTIVE,
        failedPinAttempts: 0,
        label: dto.label,
        walletNumber: await this.generateUniqueWalletNumber(),
        qrCodeToken: this.generateQrCodeToken(),
        isPrimary: existingWallets.length === 0,
      });

      return manager.save(wallet);
    };

    return externalManager ? run(externalManager) : this.dataSource.transaction(run);
  }

  /**
   * Crée un wallet de type TONTINE lié à une tontine.
   * Appelé depuis TontineService.create() dans la même transaction.
   */
  async createTontineWallet(
    creatorId: number,
    tontineId: string,
    currency: string,
    manager?: EntityManager,
  ): Promise<Wallet> {
    const run = async (em: EntityManager) => {
      const wallet = em.create(Wallet, {
        userId: creatorId,
        tontineId,
        type: WalletType.TONTINE,
        balance: '0',
        currency,
        status: WalletStatus.ACTIVE,
        isPrimary: false,
        failedPinAttempts: 0,
        walletNumber: await this.generateUniqueWalletNumber(),
        qrCodeToken: this.generateQrCodeToken(),
      });
      return em.save(wallet);
    };

    return manager ? run(manager) : this.dataSource.transaction(run);
  }

  async findAllForUser(userId: number): Promise<Wallet[]> {
    return this.walletRepo.find({
      where: { userId, type: WalletType.PERSONAL },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async findByWalletNumber(walletNumber: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { walletNumber } });
    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletNumber} introuvable`);
    }
    return wallet;
  }

  async validateByWalletNumber(walletNumber: string, userId?: number): Promise<{ valid: boolean; message?: string; ownerName?: string; currency?: string }> {
    const wallet = await this.walletRepo.findOne({
      where: { walletNumber },
      select: ['id', 'status', 'type', 'currency', 'userId'],
      relations: ['user'],
    });

    if (!wallet) {
      return { valid: false, message: 'Wallet bénéficiaire introuvable.' };
    }

    if (wallet.status !== WalletStatus.ACTIVE) {
      return { valid: false, message: `Ce wallet est ${wallet.status} et ne peut pas recevoir de fonds.` };
    }

    if (wallet.type === WalletType.TONTINE) {
      return { valid: false, message: 'Les wallets tontine ne peuvent pas recevoir de transferts directs.' };
    }

    if (userId && wallet.userId === userId) {
      return { valid: false, message: 'Vous ne pouvez pas transférer vers votre propre wallet.' };
    }

    const ownerName = wallet.user
      ? `${wallet.user.prenom ?? ''} ${wallet.user.nom ?? ''}`.trim()
      : undefined;

    return { valid: true, ownerName, currency: wallet.currency };
  }

  async findOne(id: string, userId: number): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException('Wallet introuvable');
    }
    this.assertOwnership(wallet, userId);
    return wallet;
  }

  async update(id: string, userId: number, dto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    Object.assign(wallet, dto);
    return this.walletRepo.save(wallet);
  }

  // Fermeture logique (soft) : jamais de suppression physique d'un walleT
  async close(id: string, userId: number): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    this.assertNotTontine(wallet);

    if (Number(wallet.balance) !== 0) {
      throw new BadRequestException("Impossible de fermer un wallet dont le solde n'est pas nul");
    }
    if (wallet.isPrimary) {
      throw new BadRequestException(
        'Impossible de fermer le wallet principal. Définissez un autre wallet comme principal avant.',
      );
    }

    wallet.status = WalletStatus.CLOSED;
    return this.walletRepo.save(wallet);
  }

  async setPrimary(id: string, userId: number): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const target = await manager.findOne(Wallet, { where: { id } });
      if (!target) {
        throw new NotFoundException('Wallet introuvable');
      }
      this.assertOwnership(target, userId);
      this.assertNotTontine(target);

      if (target.status !== WalletStatus.ACTIVE) {
        throw new BadRequestException('Seul un wallet actif peut devenir principal');
      }

      await manager.update(Wallet, { userId, isPrimary: true }, { isPrimary: false });
      target.isPrimary = true;
      return manager.save(target);
    });
  }

  async activate(id: string, userId: number): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    this.assertNotTontine(wallet);

    if (wallet.status !== WalletStatus.INACTIVE) {
      throw new BadRequestException('Seul un wallet inactive peut être activé');
    }

    const kyc = await this.kycRepository.findOne({ where: { userId } });
    if (!kyc || kyc.status !== KycStatus.APPROVED) {
      throw new BadRequestException("Votre KYC doit être approuvé avant d'activer votre wallet");
    }

    wallet.status = WalletStatus.ACTIVE;
    return this.walletRepo.save(wallet);
  }

  async activateByUserId(userId: number): Promise<void> {
    await this.walletRepo.update(
      { userId, status: WalletStatus.INACTIVE },
      { status: WalletStatus.ACTIVE },
    );
  }

  // garder l'atomicité (verrou + PIN + solde) d'un seul bloc.

  assertOwnership(wallet: Wallet, userId: number): void {
    if (wallet.userId !== userId) {
      throw new ForbiddenException('Ce wallet ne vous appartient pas');
    }
  }

  assertActive(wallet: Wallet): void {
    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException(`Ce wallet est ${wallet.status} et ne peut pas être utilisé`);
    }
  }

  assertNotTontine(wallet: Wallet): void {
    if (wallet.type === WalletType.TONTINE) {
      throw new BadRequestException(
        'Les opérations sur un portefeuille tontine passent par le module tontine.',
      );
    }
  }

  // SELECT ... FOR UPDATE : verrouille la ligne jusqu'à la fin de la

  async lockWalletForUpdate(manager: EntityManager, id: string, withPin = false): Promise<Wallet> {
    const qb = manager
      .createQueryBuilder(Wallet, 'wallet')
      .setLock('pessimistic_write')
      .where('wallet.id = :id', { id });

    if (withPin) {
      qb.addSelect('wallet.pinHash');
    }

    const wallet = await qb.getOne();

    if (!wallet) {
      throw new NotFoundException('Wallet introuvable');
    }
    return wallet;
  }

  async getQrCodeData(walletId: string, userId: number): Promise<{ walletId: string; qrCodeData: string }> {
    const wallet = await this.findOne(walletId, userId);
    this.assertNotTontine(wallet);
    const qrCodeData = `allnesspay://transfer?w=${wallet.walletNumber}`;
    return { walletId: wallet.id, qrCodeData };
  }

  async resolveQrCode(walletNumber: string): Promise<{ walletId: string; walletNumber: string; currency: string; ownerName: string }> {
    const wallet = await this.walletRepo.findOne({
      where: { walletNumber },
      select: ['id', 'walletNumber', 'status', 'type', 'currency'],
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('QR Code Allness Pay invalide.');
    }

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Ce portefeuille n\'est pas actif.');
    }

    if (wallet.type === WalletType.TONTINE) {
      throw new BadRequestException('Les wallets tontine ne peuvent pas recevoir de transferts directs.');
    }

    const ownerName = wallet.user
      ? `${wallet.user.prenom ?? ''} ${wallet.user.nom ?? ''}`.trim()
      : '';

    return {
      walletId: wallet.id,
      walletNumber: wallet.walletNumber,
      currency: wallet.currency,
      ownerName,
    };
  }

  private generateQrCodeToken(): string {
    return randomBytes(32).toString('hex');
  }

  private async generateUniqueWalletNumber(): Promise<string> {
    // Retry loop pour garantir l'unicité malgré la (très faible) probabilité de collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = this.buildWalletNumberCandidate();
      const exists = await this.walletRepo.exist({ where: { walletNumber: candidate } });
      if (!exists) {
        return candidate;
      }
    }
    throw new BadRequestException('Impossible de générer un numéro de wallet unique, réessayez');
  }

  private buildWalletNumberCandidate(): string {
    // Format: WLT + 10 chiffres. Adaptez le préfixe/format à vos besoins produit.
    const digits = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000).toString();
    return `WLT${digits}`;
  }
}
