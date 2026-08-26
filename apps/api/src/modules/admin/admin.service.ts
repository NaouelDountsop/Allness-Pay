import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
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
      qb.andWhere('tx.status = :status', { status: filters.status.toLowerCase() });
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

  async exportTransactionsXlsx(): Promise<Buffer> {
  const transactions = await this.transactionsRepository
    .createQueryBuilder('tx')
    .leftJoinAndSelect('tx.wallet', 'wallet')
    .leftJoin('wallet.user', 'user')
    .addSelect(['user.nom', 'user.prenom', 'user.email'])
    .orderBy('tx.createdAt', 'DESC')
    .getMany();

  const rows = transactions.map((tx) => ({
    reference: tx.reference ?? tx.id,
    user: tx.wallet?.user ? `${tx.wallet.user.prenom} ${tx.wallet.user.nom}` : '',
    email: tx.wallet?.user?.email ?? '',
    type: tx.type,
    amount: Number(tx.amount),
    status: tx.status,
    createdAt: tx.createdAt,
  }));

  return this.buildStyledWorkbook({
    sheetName: 'Transactions',
    columns: [
      { header: 'Référence', key: 'reference', width: 26 },
      { header: 'Utilisateur', key: 'user', width: 22 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Type', key: 'type', width: 16 },
      { header: 'Montant', key: 'amount', width: 16, format: 'currency' },
      { header: 'Statut', key: 'status', width: 14, format: 'status' },
      { header: 'Date', key: 'createdAt', width: 20, format: 'date' },
    ],
    rows,
  });
}

async exportUsersXlsx(): Promise<Buffer> {
  const users = await this.usersRepository.find({ order: { dateinscription: 'DESC' } });

  const rows = users.map((u) => ({
    id: u.idutilisateur,
    nom: u.nom,
    prenom: u.prenom,
    email: u.email,
    telephone: u.telephone,
    pays: u.pays,
    ville: u.ville,
    dateinscription: u.dateinscription,
    statut: u.statut,
  }));

  return this.buildStyledWorkbook({
    sheetName: 'Utilisateurs',
    columns: [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nom', key: 'nom', width: 18 },
      { header: 'Prénom', key: 'prenom', width: 18 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Téléphone', key: 'telephone', width: 18 },
      { header: 'Pays', key: 'pays', width: 14 },
      { header: 'Ville', key: 'ville', width: 14 },
      { header: 'Date inscription', key: 'dateinscription', width: 20, format: 'date' },
      { header: 'Statut', key: 'statut', width: 14, format: 'status' },
    ],
    rows,
  });
}

async exportTontinesXlsx(): Promise<Buffer> {
  const tontines = await this.findAllTontines();

  const rows = tontines.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description ?? '',
    contributionAmount: Number(t.contributionAmount),
    frequency: t.frequency,
    memberLimit: t.memberLimit,
    status: t.status,
    currentCycle: t.currentCycle,
    createdAt: t.createdAt,
  }));

  return this.buildStyledWorkbook({
    sheetName: 'Tontines',
    columns: [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nom', key: 'name', width: 22 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Cotisation', key: 'contributionAmount', width: 16, format: 'currency' },
      { header: 'Fréquence', key: 'frequency', width: 14 },
      { header: 'Membres max', key: 'memberLimit', width: 14 },
      { header: 'Statut', key: 'status', width: 14, format: 'status' },
      { header: 'Cycle actuel', key: 'currentCycle', width: 14 },
      { header: 'Date création', key: 'createdAt', width: 20, format: 'date' },
    ],
    rows,
  });
}

  //style excel
  private readonly STATUS_COLORS: Record<string, string> = {
  completed: 'FF10B981', // vert
  approved: 'FF10B981',
  active: 'FF10B981',
  pending: 'FFF59E0B', // ambre
  failed: 'FFEF4444', // rouge
  rejected: 'FFEF4444',
  cancelled: 'FF9CA3AF', // gris
};

private async buildStyledWorkbook<T extends Record<string, unknown>>(config: {
  sheetName: string;
  columns: {
    header: string;
    key: keyof T & string;
    width?: number;
    format?: 'text' | 'currency' | 'date' | 'status';
  }[];
  rows: T[];
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AllnessPay';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(config.sheetName, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = config.columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 20,
  }));

  // En-tête stylé (fond allness-dark, texte blanc gras)
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F2A2E' },
    };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF0F2A2E' } },
    };
  });
  headerRow.height = 24;
  sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + config.columns.length)}1` };

  // Lignes de données
  config.rows.forEach((row, i) => {
    const excelRow = sheet.addRow(row);
    const isEven = i % 2 === 0;

    excelRow.eachCell((cell, colNumber) => {
      const colConfig = config.columns[colNumber - 1];

      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
      cell.alignment = { vertical: 'middle' };

      if (!isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }

      if (colConfig?.format === 'currency') {
        cell.numFmt = '#,##0" XAF"';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }
      if (colConfig?.format === 'date') {
        cell.numFmt = 'dd/mm/yyyy hh:mm';
      }
      if (colConfig?.format === 'status') {
        const value = String(cell.value ?? '').toLowerCase();
        const color = this.STATUS_COLORS[value];
        if (color) {
          cell.font = { color: { argb: color }, bold: true };
        }
      }
    });
    excelRow.height = 20;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer as ArrayBuffer);
}
}

