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

  findOneKyc(id: number) {
    return this.kycRepository.findOne({ where: { id } });
  }

  async findAllTontines() {
    const tontines = await this.tontinesRepository.find({
      relations: ['createur', 'membres'],
      order: { createdAt: 'DESC' },
    });
    return tontines;
  }
}
