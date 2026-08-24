import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CycleService } from './services/cycle.service';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tontine, TontineStatus } from './entities/tontine.entity';
import { TontineMember, TontineMemberRole, TontineMemberStatus } from './entities/tontine-member.entity';
import { TontineCycle } from './entities/tontine-cycle.entity';
import { TontineCycleStatus } from './enums/tontine-cycle-status.enum';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { WalletsService } from '../wallet/wallet.service';
import { MessageService } from '../messaging/message.service';

@Injectable()
export class TontineService {
  constructor(
    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
    @InjectRepository(TontineCycle)
    private readonly cycleRepo: Repository<TontineCycle>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly walletsService: WalletsService,
    private readonly cycleService: CycleService,
    private readonly messageService: MessageService,
  ) {}

  async create(dto: CreateTontineDto, creatorId: number): Promise<Tontine> {
    return this.dataSource.transaction(async (manager) => {
      const targetAmount = BigInt(dto.contributionAmount) * BigInt(dto.memberLimit);

      const tontine = manager.create(Tontine, {
        name: dto.name,
        description: dto.description,
        targetAmount: targetAmount.toString(),
        contributionAmount: dto.contributionAmount.toString(),
        frequency: dto.frequency,
        memberLimit: dto.memberLimit,
        currency: dto.currency ?? 'XAF',
        creatorId,
        currentCycle: 0,
        status: TontineStatus.DRAFT,
      });
      const saved = await manager.save(tontine);

      const wallet = await this.walletsService.createTontineWallet(
        creatorId,
        saved.id,
        saved.currency,
        manager,
      );

      saved.walletNumber = wallet.walletNumber;
      await manager.save(saved);

      const creatorMember = manager.create(TontineMember, {
        tontineId: saved.id,
        userId: creatorId,
        role: TontineMemberRole.ADMIN,
        status: TontineMemberStatus.ACTIVE,
      });
      await manager.save(creatorMember);

      return manager.findOneOrFail(Tontine, {
        where: { id: saved.id },
        relations: ['members', 'members.user', 'creator'],
      });
    });
  }

  async findAll(userId: number): Promise<Tontine[]> {
    return this.tontineRepo
      .createQueryBuilder('t')
      .innerJoin('t.members', 'm', 'm.userId = :userId', { userId })
      .leftJoinAndSelect('t.members', 'allMembres')
      .leftJoinAndSelect('allMembres.user', 'user')
      .leftJoinAndSelect('t.creator', 'creator')
      .orderBy('t.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId?: number): Promise<Tontine> {
    const tontine = await this.tontineRepo.findOne({
      where: { id },
      relations: ['members', 'members.user', 'creator'],
    });
    if (!tontine) {
      throw new NotFoundException(`Tontine #${id} introuvable`);
    }
    if (userId !== undefined) {
      this.assertMembership(tontine, userId);
    }
    return tontine;
  }

  async update(id: string, dto: UpdateTontineDto, userId: number): Promise<Tontine> {
    const tontine = await this.findOne(id, userId);
    this.assertAdmin(tontine, userId);

    if (tontine.status !== TontineStatus.DRAFT) {
      throw new BadRequestException('Seule une tontine en DRAFT peut être modifiée');
    }

    Object.assign(tontine, dto);

    if (dto.contributionAmount !== undefined || dto.memberLimit !== undefined) {
      const contribution = dto.contributionAmount ?? Number(tontine.contributionAmount);
      const members = dto.memberLimit ?? tontine.memberLimit;
      tontine.targetAmount = (BigInt(contribution) * BigInt(members)).toString();
    }

    return this.tontineRepo.save(tontine);
  }

   async updateStatus(id: string, userId: number, newStatus: TontineStatus): Promise<Tontine> {
    const tontine = await this.findOne(id, userId);
    this.assertAdmin(tontine, userId);

    const validTransitions: Record<TontineStatus, TontineStatus[]> = {
      [TontineStatus.DRAFT]: [TontineStatus.ACTIVE, TontineStatus.CLOSED],
      [TontineStatus.ACTIVE]: [TontineStatus.CLOSED],
      [TontineStatus.CLOSED]: [],
    };

    const allowed = validTransitions[tontine.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Transition invalide: ${tontine.status} → ${newStatus}`);
    }

    tontine.status = newStatus;
    const saved = await this.tontineRepo.save(tontine);

    if (newStatus === TontineStatus.ACTIVE) {
      await this.cycleService.generateNextCycle(saved.id);
    }

    return this.findOne(saved.id, userId);
  }

  async remove(id: string, userId: number): Promise<void> {
    const tontine = await this.findOne(id, userId);
    this.assertAdmin(tontine, userId);

    if (tontine.status !== TontineStatus.DRAFT) {
      throw new BadRequestException('Seule une tontine en DRAFT peut être supprimée');
    }

    await this.tontineRepo.remove(tontine);
  }

  async addMember(tontineId: string, userId: number, memberUserId: number): Promise<TontineMember> {
    const tontine = await this.findOne(tontineId, userId);
    this.assertAdmin(tontine, userId);

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

    const saved = await this.memberRepo.save(member);

    await this.messageService.createSystemMessage(
      tontineId,
      `Un nouveau membre a rejoint la tontine`,
    );

    return saved;
  }

  async removeMember(tontineId: string, userId: number, memberId: string): Promise<void> {
    const tontine = await this.findOne(tontineId, userId);
    this.assertAdmin(tontine, userId);

    const activeCycle = await this.cycleRepo.findOne({
      where: { tontineId, status: TontineCycleStatus.ACTIVE },
    });
    if (activeCycle) {
      throw new BadRequestException(
        'Impossible de retirer un membre pendant un cycle actif.',
      );
    }

    const member = tontine.members.find((m) => m.id === memberId);
    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    if (member.role === TontineMemberRole.ADMIN) {
      throw new BadRequestException("On ne peut pas retirer l'admin");
    }

    member.status = TontineMemberStatus.REMOVED;
    await this.memberRepo.save(member);

    await this.messageService.createSystemMessage(
      tontineId,
      `Un membre a été retiré de la tontine`,
    );
  }

  async join(id: string, userId: number): Promise<TontineMember> {
    const tontine = await this.findOne(id);
    const existing = tontine.members.find((m) => m.userId === userId);
    if (existing) {
      throw new ForbiddenException('Vous êtes déjà membre de cette tontine');
    }
    if (tontine.members.length >= tontine.memberLimit) {
      throw new ForbiddenException('Cette tontine est pleine');
    }
    const member = this.memberRepo.create({
      tontineId: id,
      userId,
      role: TontineMemberRole.MEMBER,
      status: TontineMemberStatus.ACTIVE,
    });
    const saved = await this.memberRepo.save(member);

    await this.messageService.createSystemMessage(
      id,
      `Un nouveau membre a rejoint la tontine`,
    );

    return saved;
  }

  async leave(id: string, userId: number): Promise<void> {
    const tontine = await this.findOne(id, userId);

    const activeCycle = await this.cycleRepo.findOne({
      where: { tontineId: id, status: TontineCycleStatus.ACTIVE },
    });
    if (activeCycle) {
      throw new BadRequestException(
        'Impossible de quitter la tontine pendant un cycle actif. Attendez la fin du cycle.',
      );
    }

    const member = tontine.members.find(
      (m) => m.userId === userId && m.status === TontineMemberStatus.ACTIVE,
    );
    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }
    if (member.role === TontineMemberRole.ADMIN) {
      throw new BadRequestException(
        "L'administrateur ne peut pas quitter la tontine. Transférez le rôle ou supprimez-la.",
      );
    }
    member.status = TontineMemberStatus.LEFT;
    await this.memberRepo.save(member);

    await this.messageService.createSystemMessage(
      id,
      `Un membre a quitté la tontine`,
    );
  }

  async findMember(tontineId: string, userId: number): Promise<TontineMember> {
    const member = await this.memberRepo.findOne({
      where: { tontineId, userId, status: TontineMemberStatus.ACTIVE },
    });
    if (!member) {
      throw new NotFoundException("Vous n'êtes pas membre actif de cette tontine");
    }
    return member;
  }

  async reorderMembers(tontineId: string, userId: number, memberIds: string[]): Promise<TontineMember[]> {
    const tontine = await this.findOne(tontineId, userId);
    this.assertAdmin(tontine, userId);

    const activeMembers = tontine.members.filter((m) => m.status === TontineMemberStatus.ACTIVE);
    const activeIds = new Set(activeMembers.map((m) => m.id));

    const validIds = memberIds.filter((id) => activeIds.has(id));
    if (validIds.length !== activeMembers.length) {
      throw new BadRequestException("La liste des membres ne correspond pas aux membres actifs");
    }

    for (let i = 0; i < validIds.length; i++) {
      await this.memberRepo.update(validIds[i], { beneficiaryOrder: i + 1 });
    }

    return this.memberRepo.find({
      where: { tontineId, status: TontineMemberStatus.ACTIVE },
      order: { beneficiaryOrder: 'ASC' },
    });
  }

  private assertMembership(tontine: Tontine, userId: number): void {
    const isMember = tontine.members?.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException("Vous n'êtes pas membre de cette tontine");
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
}
