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

  findAllKyc(status?: string) {
    if (status) {
      return this.kycRepository.find({
        where: { status: status as KycStatus },
        order: { createdAt: 'DESC' },
      });
    }
    return this.kycRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneKyc(id: number) {
    const kyc = await this.kycRepository.findOne({ where: { id } });
    if (!kyc) return null;
    const user = await this.usersRepository.findOne({
      where: { idutilisateur: kyc.userId },
      select: ['nom', 'prenom', 'email'],
    });
    return { ...kyc, userName: user?.prenom ?? null, userNom: user?.nom ?? null, userEmail: user?.email ?? null };
  }

  async findAllTontines() {
    const tontines = await this.tontinesRepository.find({
      relations: ['creator', 'members'],
      order: { createdAt: 'DESC' },
    });
    return tontines;
  }

  async getTransactionStats() {
    const totalTransactions = await this.transactionsRepository.count();

    const completedCount = await this.transactionsRepository
      .createQueryBuilder('tx')
      .getCount();

    const volumeResult = await this.transactionsRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .getRawOne();
    const totalVolume = Number(volumeResult?.total ?? 0);

    return {
      totalTransactions,
      completedCount,
      totalVolume,
    };
  }

  async findAllTransactions() {
    const transactions = await this.transactionsRepository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.wallet', 'wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .leftJoinAndSelect('tx.relatedWallet', 'relatedWallet')
      .orderBy('tx.createdAt', 'DESC')
      .limit(100)
      .getMany();

    return transactions.map((tx) => ({
      id: tx.id,
      reference: tx.reference ?? tx.id.slice(0, 8).toUpperCase(),
      user: tx.wallet?.user
        ? `${tx.wallet.user.prenom ?? ''} ${tx.wallet.user.nom ?? ''}`.trim()
        : 'Utilisateur inconnu',
      email: tx.wallet?.user?.email ?? null,
      type: tx.type,
      amount: Number(tx.amount),
      status: 'Complété' as const,
      description: tx.description ?? null,
      createdAt: tx.createdAt,
    }));
  }

  async getRecentActivities() {
    const recentTransactions = await this.transactionsRepository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.wallet', 'wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .orderBy('tx.createdAt', 'DESC')
      .limit(10)
      .getMany();

    const recentUsers = await this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.dateinscription', 'DESC')
      .limit(5)
      .getMany();

    const activities: Array<{
      type: string;
      title: string;
      meta: string;
      createdAt: Date;
    }> = [];

    for (const tx of recentTransactions) {
      const userName = tx.wallet?.user
        ? `${tx.wallet.user.prenom ?? ''} ${tx.wallet.user.nom ?? ''}`.trim()
        : 'Utilisateur';
      const typeLabel =
        tx.type === 'deposit'
          ? 'Dépôt'
          : tx.type === 'withdrawal'
            ? 'Retrait'
            : tx.type === 'transfer_in'
              ? 'Transfert reçu'
              : 'Transfert envoyé';
      activities.push({
        type: tx.type,
        title: `${typeLabel} — ${userName}`,
        meta: `${Number(tx.amount).toLocaleString('fr-FR')} XAF`,
        createdAt: tx.createdAt,
      });
    }

    for (const user of recentUsers) {
      const timeDiff = Date.now() - new Date(user.dateinscription).getTime();
      if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
        activities.push({
          type: 'user_registered',
          title: `Nouvel inscrit — ${user.prenom ?? ''} ${user.nom ?? ''}`.trim(),
          meta: user.email ?? '',
          createdAt: new Date(user.dateinscription),
        });
      }
    }

    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return activities.slice(0, 10);
  }

  async getKycPending(limit = 5) {
    const pending = await this.kycRepository
      .createQueryBuilder('kyc')
      .where('kyc.status = :status', { status: KycStatus.PENDING })
      .orderBy('kyc.createdAt', 'ASC')
      .limit(limit)
      .getMany();

    const results = [];
    for (const kyc of pending) {
      const user = await this.usersRepository.findOne({
        where: { idutilisateur: kyc.userId },
        select: ['nom', 'prenom', 'email'],
      });
      results.push({
        id: kyc.id,
        userId: kyc.userId,
        userName: user ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() : 'Inconnu',
        userEmail: user?.email ?? null,
        documentType: kyc.IdentityDocumentType ?? null,
        createdAt: kyc.createdAt,
      });
    }
    return results;
  }

  async getChartWeekly() {
    const result = await this.transactionsRepository
      .createQueryBuilder('tx')
      .select("to_char(tx.createdAt, 'Dy')", 'day')
      .addSelect('SUM(tx.amount)', 'value')
      .where("tx.createdAt >= date_trunc('week', NOW())")
      .groupBy("to_char(tx.createdAt, 'Dy')")
      .orderBy("min(tx.createdAt)", 'ASC')
      .getRawMany();

    const dayMap: Record<string, number> = {};
    for (const r of result) {
      dayMap[r.day] = Number(r.value);
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const frenchDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map((d, i) => ({
      day: frenchDays[i],
      value: dayMap[d] ?? 0,
    }));
  }

  async getTontineStats() {
    const totalTontines = await this.tontinesRepository.count();

    const activeTontines = await this.tontinesRepository
      .createQueryBuilder('t')
      .where("t.status = 'active'")
      .getCount();

    const volumeResult = await this.tontinesRepository
      .createQueryBuilder('t')
      .select('SUM(t.contributionAmount * t.memberLimit)', 'total')
      .getRawOne();
    const totalVolume = Number(volumeResult?.total ?? 0);

    return {
      totalTontines,
      activeTontines,
      totalVolume,
    };
  }
}
