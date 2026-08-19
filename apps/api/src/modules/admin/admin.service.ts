import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Kyc, KycStatus } from '../kyc/entities/kyc.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../transactions/entities/wallet-transaction.entity';
import { Tontine } from '../tontine/entities/tontine.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Kyc)
    private readonly kycRepository: Repository<Kyc>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionsRepository: Repository<WalletTransaction>,
    @InjectRepository(Tontine)
    private readonly tontinesRepository: Repository<Tontine>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.usersRepository.count();

    const kycPending = await this.kycRepository.count({
      where: { status: KycStatus.PENDING },
    });
    const kycApproved = await this.kycRepository.count({
      where: { status: KycStatus.APPROVED },
    });
    const kycRejected = await this.kycRepository.count({
      where: { status: KycStatus.REJECTED },
    });
    const totalKyc = kycPending + kycApproved + kycRejected;

    const totalWallets = await this.walletsRepository.count();

    const totalTransactions = await this.transactionsRepository.count();

    const liquidityResult = await this.walletsRepository
      .createQueryBuilder('wallet')
      .select('SUM(wallet.balance)', 'total')
      .getRawOne();
    const totalLiquidity = Number(liquidityResult?.total ?? 0);

    const monthlyVolumeResult = await this.transactionsRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where("tx.createdAt >= date_trunc('month', NOW())")
      .getRawOne();
    const monthlyVolume = Number(monthlyVolumeResult?.total ?? 0);

    return {
      totalUsers,
      totalWallets,
      totalTransactions,
      totalLiquidity,
      monthlyVolume,
      kyc: {
        total: totalKyc,
        pending: kycPending,
        approved: kycApproved,
        rejected: kycRejected,
      },
    };
  }

  findAllUsers() {
    return this.usersRepository.find({
      order: { dateinscription: 'DESC' },
    });
  }

  findOneUser(id: number) {
    return this.usersRepository.findOne({ where: { idutilisateur: id } });
  }

  async findAllKyc(status?: string) {
    const where = status ? { status: status as KycStatus } : {};
    const kycs = await this.kycRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    if (kycs.length === 0) return [];

    const userIds = [...new Set(kycs.map((k) => k.userId))];
    const users = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.idutilisateur', 'u.nom', 'u.prenom', 'u.email'])
      .where('u.idutilisateur IN (:...ids)', { ids: userIds })
      .getMany();
    const userMap = new Map(users.map((u) => [u.idutilisateur, u]));

    return kycs.map((kyc) => {
      const user = userMap.get(kyc.userId);
      return {
        ...kyc,
        userName: user?.prenom ?? null,
        userNom: user?.nom ?? null,
        userEmail: user?.email ?? null,
      };
    });
  }

  async findOneKyc(id: number) {
    const kyc = await this.kycRepository.findOne({ where: { id } });
    if (!kyc) return null;
    const user = await this.usersRepository.findOne({
      where: { idutilisateur: kyc.userId },
      select: ['nom', 'prenom', 'email'],
    });
    return {
      ...kyc,
      userName: user?.prenom ?? null,
      userNom: user?.nom ?? null,
      userEmail: user?.email ?? null,
    };
  }

  async findAllTontines() {
    const tontines = await this.tontinesRepository.find({
      relations: ['creator', 'members'],
      order: { createdAt: 'DESC' },
    });
    return tontines;
  }

  async findAllTransactions(filters?: {
    status?: string;
    type?: string;
    provider?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters?.page ?? 1;
    const pageSize = Math.min(filters?.pageSize ?? 20, 50);
    const skip = (page - 1) * pageSize;

    const qb = this.transactionsRepository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.wallet', 'wallet');

    if (filters?.status) {
      qb.andWhere('tx.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      qb.andWhere('tx.type = :type', { type: filters.type });
    }
    if (filters?.provider) {
      qb.andWhere('tx.provider = :provider', { provider: filters.provider });
    }

    const [data, totalItems] = await qb
      .orderBy('tx.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      data,
      totalItems,
      page,
      pageSize,
      pageCount: Math.ceil(totalItems / pageSize),
    };
  }

  async getRecentActivities() {
    const transactions = await this.transactionsRepository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.wallet', 'wallet')
      .leftJoin('wallet.user', 'user')
      .addSelect(['user.nom', 'user.prenom'])
      .orderBy('tx.createdAt', 'DESC')
      .limit(5)
      .getMany();

    return transactions.map((tx) => {
      const userName = tx.wallet?.user
        ? `${tx.wallet.user.prenom} ${tx.wallet.user.nom}`
        : 'Utilisateur';
      const amount = Number(tx.amount);
      const typeMap: Record<string, string> = {
        deposit: 'deposit',
        withdrawal: 'withdrawal',
        transfer_in: 'transfer_in',
        transfer_out: 'transfer_out',
      };
      return {
        type: typeMap[tx.type] ?? tx.type,
        title: tx.description ?? `${tx.type} — ${amount.toLocaleString('fr-FR')} XAF`,
        meta: `${userName}`,
        createdAt: tx.createdAt.toISOString(),
      };
    });
  }

  async getKycPending() {
    const kycRecords = await this.kycRepository
      .createQueryBuilder('kyc')
      .where('kyc.status = :status', { status: KycStatus.PENDING })
      .orderBy('kyc.createdAt', 'DESC')
      .limit(4)
      .getMany();

    const userIds = [...new Set(kycRecords.map((k) => k.userId))];
    const users = userIds.length > 0
      ? await this.usersRepository
          .createQueryBuilder('user')
          .where('user.idutilisateur IN (:...ids)', { ids: userIds })
          .getMany()
      : [];
    const userMap = new Map(users.map((u) => [u.idutilisateur, u]));

    return kycRecords.map((kyc) => {
      const user = userMap.get(kyc.userId);
      return {
        id: kyc.id,
        userId: kyc.userId,
        userName: user
          ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || `Utilisateur ${kyc.userId}`
          : `Utilisateur ${kyc.userId}`,
        userEmail: user?.email ?? null,
        documentType: kyc.IdentityDocumentType ?? null,
        createdAt: kyc.createdAt.toISOString(),
      };
    });
  }

  async getChartWeekly() {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const result = await this.transactionsRepository
      .createQueryBuilder('tx')
      .select("to_char(tx.createdAt, 'Dy')", 'day')
      .addSelect('SUM(tx.amount)', 'value')
      .where('tx.createdAt >= :start', { start: startOfWeek.toISOString() })
      .groupBy("to_char(tx.createdAt, 'Dy')")
      .orderBy("min(tx.createdAt)", 'ASC')
      .getRawMany();

    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: Record<string, string> = {
      Mon: 'Lun', Tue: 'Mar', Wed: 'Mer', Thu: 'Jeu', Fri: 'Ven', Sat: 'Sam', Sun: 'Dim',
    };

    return dayOrder.map((day) => ({
      day: dayMap[day] ?? day,
      value: Number(result.find((r: { day: string }) => r.day === day)?.value ?? 0),
    }));
  }

  async exportTransactionsCsv(): Promise<string> {
    const transactions = await this.transactionsRepository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.wallet', 'wallet')
      .leftJoin('wallet.user', 'user')
      .addSelect(['user.nom', 'user.prenom', 'user.email'])
      .orderBy('tx.createdAt', 'DESC')
      .getMany();

    const headers = ['Référence', 'Utilisateur', 'Email', 'Type', 'Montant', 'Statut', 'Date'];
    const rows = transactions.map((tx) => {
      const userName = tx.wallet?.user
        ? `${tx.wallet.user.prenom} ${tx.wallet.user.nom}`
        : '';
      return [
        tx.reference ?? tx.id,
        userName,
        tx.wallet?.user?.email ?? '',
        tx.type,
        String(tx.amount),
        tx.status,
        tx.createdAt.toISOString(),
      ];
    });
    return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  }

  async exportUsersCsv(): Promise<string> {
    const users = await this.usersRepository.find({ order: { dateinscription: 'DESC' } });
    const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Pays', 'Ville', 'Date inscription', 'Statut'];
    const rows = users.map((u) => [
      String(u.idutilisateur),
      u.nom,
      u.prenom,
      u.email,
      u.telephone,
      u.pays,
      u.ville,
      u.dateinscription.toISOString(),
      u.statut,
    ]);
    return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  }

  async exportTontinesCsv(): Promise<string> {
    const tontines = await this.findAllTontines();
    const headers = ['ID', 'Nom', 'Description', 'Montant cotisation', 'Fréquence', 'Membres max', 'Statut', 'Cycle actuel', 'Date création'];
    const rows = tontines.map((t) => [
      t.id,
      t.name,
      t.description ?? '',
      t.contributionAmount,
      t.frequency,
      String(t.memberLimit),
      t.status,
      String(t.currentCycle),
      t.createdAt.toISOString(),
    ]);
    return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  }
}
