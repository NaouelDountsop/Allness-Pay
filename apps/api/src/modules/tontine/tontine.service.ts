import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tontine, TontineStatus } from './entities/tontine.entity';
import {
  TontineMember,
  TontineMemberRole,
  TontineMemberStatus,
} from './entities/tontine-member.entity';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { WalletsService } from '../wallet/wallet.service';

@Injectable()
export class TontineService {
  constructor(
    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly walletsService: WalletsService,
  ) {}

  async create(dto: CreateTontineDto, creatorId: number): Promise<Tontine> {
    return this.dataSource.transaction(async (manager) => {
      const tontine = manager.create(Tontine, {
        name: dto.name,
        description: dto.description,
        targetAmount: dto.targetAmount.toString(),
        contributionAmount: dto.contributionAmount.toString(),
        frequency: dto.frequency,
        memberLimit: dto.memberLimit,
        currency: dto.currency ?? 'XAF',
        creatorId,
        currentCycle: 0,
        status: TontineStatus.DRAFT,
      });
      const saved = await manager.save(tontine);

      // Création atomique du wallet TONTINE lié à cette tontine
      const wallet = await this.walletsService.createTontineWallet(
        creatorId,
        saved.id,
        saved.currency,
        manager,
      );

      // Liaison du wallet à la tontine via le walletNumber
      saved.walletNumber = wallet.walletNumber;
      await manager.save(saved);

      const creatorMember = manager.create(TontineMember, {
        tontineId: saved.id,
        userId: creatorId,
        role: TontineMemberRole.ADMIN,
        status: TontineMemberStatus.ACTIVE,
      });
      await manager.save(creatorMember);

      // Retourner depuis le manager ( données non commitées visibles )
      return manager.findOneOrFail(Tontine, {
        where: { id: saved.id },
        relations: ['membres', 'membres.user', 'creator'],
      });
    });
  }

  async findAll(userId: number): Promise<Tontine[]> {
    return this.tontineRepo
      .createQueryBuilder('t')
      .innerJoin('t.membres', 'm', 'm.userId = :userId', { userId })
      .leftJoinAndSelect('t.membres', 'allMembres')
      .leftJoinAndSelect('allMembres.user', 'user')
      .leftJoinAndSelect('t.creator', 'creator')
      .orderBy('t.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId?: number): Promise<Tontine> {
    const tontine = await this.tontineRepo.findOne({
      where: { id },
      relations: ['membres', 'membres.user', 'creator'],
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
    return this.tontineRepo.save(tontine);
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

    const activeCount = tontine.membres.filter(
      (m) => m.status === TontineMemberStatus.ACTIVE,
    ).length;
    if (activeCount >= tontine.memberLimit) {
      throw new BadRequestException('La tontine est pleine');
    }

    const existing = tontine.membres.find(
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
    const tontine = await this.findOne(tontineId, userId);
    this.assertAdmin(tontine, userId);

    const member = tontine.membres.find((m) => m.id === memberId);
    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    if (member.role === TontineMemberRole.ADMIN) {
      throw new BadRequestException("On ne peut pas retirer l'admin");
    }

    member.status = TontineMemberStatus.REMOVED;
    await this.memberRepo.save(member);
  }

  async join(id: string, userId: number): Promise<TontineMember> {
    const tontine = await this.findOne(id);
    const existing = tontine.membres.find((m) => m.userId === userId);
    if (existing) {
      throw new ForbiddenException('Vous êtes déjà membre de cette tontine');
    }
    if (tontine.membres.length >= tontine.memberLimit) {
      throw new ForbiddenException('Cette tontine est pleine');
    }
    const member = this.memberRepo.create({
      tontineId: id,
      userId,
      role: TontineMemberRole.MEMBER,
      status: TontineMemberStatus.ACTIVE,
    });
    return this.memberRepo.save(member);
  }

  async leave(id: string, userId: number): Promise<void> {
    const tontine = await this.findOne(id, userId);
    const member = tontine.membres.find(
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
  }

  private assertMembership(tontine: Tontine, userId: number): void {
    const isMember = tontine.membres?.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException("Vous n'êtes pas membre de cette tontine");
    }
  }

  private assertAdmin(tontine: Tontine, userId: number): void {
    const isAdmin = tontine.membres?.some(
      (m) => m.userId === userId && m.role === TontineMemberRole.ADMIN,
    );
    if (!isAdmin) {
      throw new ForbiddenException('Seul un admin peut effectuer cette action');
    }
  }
}
