import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tontine } from '../entities/tontine.entity';
import { TontineMember } from '../entities/tontine-member.entity';
import { CreateTontineDto } from '../dto/create-tontine.dto';
import { UpdateTontineDto } from '../dto/update-tontine.dto';
import { TontineStatus } from '../enums/tontine-status.enum';
import { TontineMemberRole } from '../enums/tontine-member-role.enum';
import { TontineMemberStatus } from '../enums/tontine-member-status.enum';
import { TontineSummary } from '../interfaces/tontine-summary.interface';
import { WalletsService } from '../../wallet/wallet.service';

const VALID_STATUS_TRANSITIONS: Record<TontineStatus, TontineStatus[]> = {
  [TontineStatus.DRAFT]: [TontineStatus.ACTIVE, TontineStatus.CLOSED],
  [TontineStatus.ACTIVE]: [TontineStatus.CLOSED],
  [TontineStatus.CLOSED]: [],
};

@Injectable()
export class TontineService {
  constructor(
    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
    private readonly walletsService: WalletsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateTontineDto): Promise<Tontine> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await this.walletsService.create(
        userId,
        { currency: dto.currency, label: `Tontine - ${dto.name}` },
        manager,
      );

      const tontine = manager.create(Tontine, {
        name: dto.name,
        description: dto.description,
        targetAmount: dto.targetAmount,
        contributionAmount: dto.contributionAmount,
        memberLimit: dto.memberLimit,
        currency: dto.currency,
        frequency: dto.frequency,
        status: TontineStatus.DRAFT,
        currentCycle: 0,
        creatorId: userId,
        walletId: wallet.id,
      });

      const saved = await manager.save(tontine);

      const admin = manager.create(TontineMember, {
        tontineId: saved.id,
        userId,
        role: TontineMemberRole.ADMIN,
        status: TontineMemberStatus.ACTIVE,
        beneficiaryOrder: 1,
      });
      await manager.save(admin);

      return saved;
    });
  }

  async findAll(userId: number): Promise<TontineSummary[]> {
    const tontines = await this.tontineRepo.find({
      relations: ['members', 'cycles', 'wallet'],
      order: { createdAt: 'DESC' },
    });

    return tontines
      .filter((t) => t.members?.some((m) => m.userId === userId))
      .map((t) => this.toSummary(t));
  }

  async findOne(id: string, userId: number): Promise<TontineSummary> {
    const tontine = await this.loadTontine(id);
    this.assertMembership(tontine, userId);
    return this.toSummary(tontine);
  }

  async update(id: string, userId: number, dto: UpdateTontineDto): Promise<Tontine> {
    const tontine = await this.loadTontine(id);
    this.assertAdmin(tontine, userId);

    if (tontine.status !== TontineStatus.DRAFT) {
      throw new BadRequestException('Seule une tontine en DRAFT peut être modifiée');
    }

    Object.assign(tontine, dto);
    return this.tontineRepo.save(tontine);
  }

  async updateStatus(id: string, userId: number, newStatus: TontineStatus): Promise<Tontine> {
    const tontine = await this.loadTontine(id);
    this.assertAdmin(tontine, userId);

    const allowed = VALID_STATUS_TRANSITIONS[tontine.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transition invalide: ${tontine.status} → ${newStatus}`,
      );
    }

    if (newStatus === TontineStatus.ACTIVE) {
      const activeMembers = tontine.members.filter(
        (m) => m.status === TontineMemberStatus.ACTIVE,
      );
      if (activeMembers.length < 2) {
        throw new BadRequestException(
          'Au moins 2 membres actifs requis pour activer la tontine',
        );
      }
    }

    tontine.status = newStatus;
    return this.tontineRepo.save(tontine);
  }

  async remove(id: string, userId: number): Promise<void> {
    const tontine = await this.loadTontine(id);
    this.assertAdmin(tontine, userId);

    if (tontine.status !== TontineStatus.DRAFT) {
      throw new BadRequestException('Seule une tontine en DRAFT peut être supprimée');
    }

    await this.tontineRepo.remove(tontine);
  }

  async addMember(tontineId: string, userId: number, memberUserId: number): Promise<TontineMember> {
    const tontine = await this.loadTontine(tontineId);
    this.assertAdmin(tontine, userId);

    if (tontine.status !== TontineStatus.DRAFT) {
      throw new BadRequestException('On ne peut ajouter des membres qu\'à une tontine en DRAFT');
    }

    const activeCount = tontine.members.filter(
      (m) => m.status === TontineMemberStatus.ACTIVE,
    ).length;
    if (activeCount >= tontine.memberLimit) {
      throw new BadRequestException('La tontine est pleine');
    }

    const existing = tontine.members.find(
      (m) => m.userId === memberUserId && m.status !== TontineMemberStatus.REMOVED,
    );
    if (existing) {
      throw new BadRequestException('Cet utilisateur est déjà membre');
    }

    const member = this.memberRepo.create({
      tontineId,
      userId: memberUserId,
      role: TontineMemberRole.MEMBER,
      status: TontineMemberStatus.ACTIVE,
    });

    return this.memberRepo.save(member);
  }

  async removeMember(tontineId: string, userId: number, memberId: string): Promise<void> {
    const tontine = await this.loadTontine(tontineId);
    this.assertAdmin(tontine, userId);

    const member = tontine.members.find((m) => m.id === memberId);
    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    if (member.role === TontineMemberRole.ADMIN) {
      throw new BadRequestException('On ne peut pas retirer l\'admin');
    }

    member.status = TontineMemberStatus.REMOVED;
    await this.memberRepo.save(member);
  }

  async getWalletId(tontineId: string): Promise<string> {
    const tontine = await this.loadTontine(tontineId);
    return tontine.walletId;
  }

  private async loadTontine(id: string): Promise<Tontine> {
    const tontine = await this.tontineRepo.findOne({
      where: { id },
      relations: ['members', 'cycles', 'wallet'],
    });
    if (!tontine) {
      throw new NotFoundException(`Tontine ${id} introuvable`);
    }
    return tontine;
  }

  private assertMembership(tontine: Tontine, userId: number): void {
    const isMember = tontine.members?.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Vous n\'êtes pas membre de cette tontine');
    }
  }

  private assertAdmin(tontine: Tontine, userId: number): void {
    const isAdmin = tontine.members?.some(
      (m) => m.userId === userId && m.role === TontineMemberRole.ADMIN,
    );
    if (!isAdmin) {
      throw new ForbiddenException('Seul un admin peut effectuer cette action');
    }
  }

  private toSummary(tontine: Tontine): TontineSummary {
    const activeMembers = tontine.members?.filter(
      (m) => m.status === TontineMemberStatus.ACTIVE,
    ) ?? [];
    const currentCycle = tontine.cycles?.find(
      (c) => c.cycleNumber === tontine.currentCycle,
    );

    return {
      id: tontine.id,
      name: tontine.name,
      description: tontine.description,
      targetAmount: tontine.targetAmount,
      contributionAmount: tontine.contributionAmount,
      memberLimit: tontine.memberLimit,
      currency: tontine.currency,
      frequency: tontine.frequency,
      status: tontine.status,
      currentCycle: tontine.currentCycle,
      nextContributionAt: tontine.nextContributionAt,
      creatorId: tontine.creatorId,
      walletId: tontine.walletId,
      createdAt: tontine.createdAt,
      memberCount: activeMembers.length,
      members: activeMembers.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        status: m.status,
        beneficiaryOrder: m.beneficiaryOrder,
        hasReceivedPayout: m.hasReceivedPayout,
      })),
      currentCycleSummary: currentCycle
        ? {
            id: currentCycle.id,
            cycleNumber: currentCycle.cycleNumber,
            beneficiaryId: currentCycle.beneficiaryId,
            status: currentCycle.status,
            totalPot: currentCycle.totalPot,
            collectedAmount: currentCycle.collectedAmount,
            dueDate: currentCycle.dueDate,
          }
        : undefined,
    };
  }
}
