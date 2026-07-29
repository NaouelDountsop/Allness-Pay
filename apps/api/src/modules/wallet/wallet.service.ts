import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}


  async create(userId: string, dto: CreateWalletDto): Promise<Wallet> {
    // Transaction + verrou pour éviter que deux créations concurrentes du
    // premier wallet d'un utilisateur ne se retrouvent toutes les deux
    // avec isPrimary = true.
    return this.dataSource.transaction(async (manager) => {
      const existingCount = await manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.userId = :userId', { userId })
        .getCount();

      const wallet = manager.create(Wallet, {
        userId,
        currency: dto.currency ?? 'XAF',
        label: dto.label,
        walletNumber: await this.generateUniqueWalletNumber(),
        // Le premier wallet d'un utilisateur devient automatiquement son wallet principal.
        isPrimary: existingCount === 0,
      });

      return manager.save(wallet);
    });
  }

  async findAllForUser(userId: string): Promise<Wallet[]> {
    return this.walletRepo.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException('Wallet introuvable');
    }
    this.assertOwnership(wallet, userId);
    return wallet;
  }

  async update(id: string, userId: string, dto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);
    Object.assign(wallet, dto);
    return this.walletRepo.save(wallet);
  }

  // Fermeture logique (soft) : jamais de suppression physique d'un walleT
  async close(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.findOne(id, userId);

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

  async setPrimary(id: string, userId: string): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const target = await manager.findOne(Wallet, { where: { id } });
      if (!target) {
        throw new NotFoundException('Wallet introuvable');
      }
      this.assertOwnership(target, userId);

      if (target.status !== WalletStatus.ACTIVE) {
        throw new BadRequestException('Seul un wallet actif peut devenir principal');
      }

      await manager.update(Wallet, { userId, isPrimary: true }, { isPrimary: false });
      target.isPrimary = true;
      return manager.save(target);
    });
  }

  // garder l'atomicité (verrou + PIN + solde) d'un seul bloc.


  assertOwnership(wallet: Wallet, userId: string): void {
    if (wallet.userId !== userId) {
      throw new ForbiddenException('Ce wallet ne vous appartient pas');
    }
  }

  assertActive(wallet: Wallet): void {
    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException(`Ce wallet est ${wallet.status} et ne peut pas être utilisé`);
    }
  }

  // SELECT ... FOR UPDATE : verrouille la ligne jusqu'à la fin de la
  // transaction du manager fourni, pour empêcher toute lecture/écriture
  // concurrente du même solde ou du même compteur de tentatives de PIN.
  async lockWalletForUpdate(
    manager: EntityManager,
    id: string,
    withPin = false,
  ): Promise<Wallet> {
    const qb = manager
      .createQueryBuilder(Wallet, 'wallet')
      .setLock('pessimistic_write')
      .where('wallet.id = :id', { id });

    // pinHash est en select:false par défaut sur l'entité (bonne pratique de
    // sécurité) : on doit le redemander explicitement quand on en a besoin.
    if (withPin) {
      qb.addSelect('wallet.pinHash');
    }

    const wallet = await qb.getOne();

    if (!wallet) {
      throw new NotFoundException('Wallet introuvable');
    }
    return wallet;
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