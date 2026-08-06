import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tontine, TontineStatus } from './entities/tontine.entity';
import { TontineMember, TontineMemberRole, TontineMemberStatus } from './entities/tontine-member.entity';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
@Injectable()
export class TontineService {
  constructor(
    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
  ) {}

  async create(dto: CreateTontineDto, createurId: number): Promise<Tontine> {
    const tontine = this.tontineRepo.create({
      ...dto,
      createurId,
      tourActuel: 0,
      statut: TontineStatus.DRAFT,
    });
    const saved = await this.tontineRepo.save(tontine);

    const creatorMember = this.memberRepo.create({
      tontineId: saved.id,
      userId: createurId,
      role: TontineMemberRole.ADMIN,
      status: TontineMemberStatus.ACTIVE,
      tourOrdre: 1,
      aPayeTourActuel: false,
    });
    await this.memberRepo.save(creatorMember);

    return this.findOne(saved.id, createurId);
  }

  async findAll(userId: number): Promise<Tontine[]> {
    return this.tontineRepo
      .createQueryBuilder('t')
      .innerJoin('t.membres', 'm', 'm.userId = :userId', { userId })
      .leftJoinAndSelect('t.membres', 'allMembres')
      .leftJoinAndSelect('allMembres.user', 'user')
      .leftJoinAndSelect('t.createur', 'createur')
      .orderBy('t.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number, userId?: number): Promise<Tontine> {
    const tontine = await this.tontineRepo.findOne({
      where: { id },
      relations: ['membres', 'membres.user', 'createur'],
    });
    if (!tontine) {
      throw new NotFoundException(`Tontine #${id} introuvable`);
    }
    if (userId !== undefined) {
      this.assertMembership(tontine, userId);
    }
    return tontine;
  }

  async update(id: number, dto: UpdateTontineDto, userId: number): Promise<Tontine> {
    const tontine = await this.findOne(id, userId);
    this.assertAdmin(tontine, userId);

    if (tontine.statut !== TontineStatus.DRAFT) {
      throw new BadRequestException('Seule une tontine en DRAFT peut être modifiée');
    }

    Object.assign(tontine, dto);
    return this.tontineRepo.save(tontine);
  }

  async updateStatus(id: number, userId: number, newStatus: TontineStatus): Promise<Tontine> {
    const tontine = await this.findOne(id, userId);
    this.assertAdmin(tontine, userId);

    const validTransitions: Record<TontineStatus, TontineStatus[]> = {
      [TontineStatus.DRAFT]: [TontineStatus.ACTIVE, TontineStatus.CLOSED],
      [TontineStatus.ACTIVE]: [TontineStatus.CLOSED],
      [TontineStatus.CLOSED]: [],
    };

    const allowed = validTransitions[tontine.statut];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transition invalide: ${tontine.statut} → ${newStatus}`,
      );
    }

    tontine.statut = newStatus;
    return this.tontineRepo.save(tontine);
  }

  async remove(id: number, userId: number): Promise<void> {
    const tontine = await this.findOne(id, userId);
    this.assertAdmin(tontine, userId);

    if (tontine.statut !== TontineStatus.DRAFT) {
      throw new BadRequestException('Seule une tontine en DRAFT peut être supprimée');
    }

    await this.tontineRepo.remove(tontine);
  }

  async addMember(tontineId: number, userId: number, memberUserId: number): Promise<TontineMember> {
    const tontine = await this.findOne(tontineId, userId);
    this.assertAdmin(tontine, userId);

    const activeCount = tontine.membres.filter(
      (m) => m.status === TontineMemberStatus.ACTIVE,
    ).length;
    if (activeCount >= tontine.nombreMembres) {
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
      tourOrdre: activeCount + 1,
    });

    return this.memberRepo.save(member);
  }

  async removeMember(tontineId: number, userId: number, memberId: number): Promise<void> {
    const tontine = await this.findOne(tontineId, userId);
    this.assertAdmin(tontine, userId);

    const member = tontine.membres.find((m) => m.id === memberId);
    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    if (member.role === TontineMemberRole.ADMIN) {
      throw new BadRequestException('On ne peut pas retirer l\'admin');
    }

    member.status = TontineMemberStatus.REMOVED;
    await this.memberRepo.save(member);
  }

  async join(id: number, userId: number): Promise<TontineMember> {
    const tontine = await this.findOne(id);
    const existing = tontine.membres.find((m) => m.userId === userId);
    if (existing) {
      throw new ForbiddenException('Vous êtes déjà membre de cette tontine');
    }
    if (tontine.membres.length >= tontine.nombreMembres) {
      throw new ForbiddenException('Cette tontine est pleine');
    }
    const member = this.memberRepo.create({
      tontineId: id,
      userId,
      role: TontineMemberRole.MEMBER,
      status: TontineMemberStatus.ACTIVE,
      tourOrdre: tontine.membres.length + 1,
    });
    return this.memberRepo.save(member);
  }

  async leave(id: number, userId: number): Promise<void> {
    const tontine = await this.findOne(id, userId);
    const member = tontine.membres.find(
      (m) => m.userId === userId && m.status === TontineMemberStatus.ACTIVE,
    );
    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }
    if (member.role === TontineMemberRole.ADMIN) {
      throw new BadRequestException('L\'administrateur ne peut pas quitter la tontine. Transférez le rôle ou supprimez-la.');
    }
    member.status = TontineMemberStatus.LEFT;
    await this.memberRepo.save(member);
  }

  private assertMembership(tontine: Tontine, userId: number): void {
    const isMember = tontine.membres?.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Vous n\'êtes pas membre de cette tontine');
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
