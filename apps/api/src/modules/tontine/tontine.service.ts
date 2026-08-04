import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tontine, TontineMember } from './entities/tontine.entity';
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
    });
    const saved = await this.tontineRepo.save(tontine);

    const creatorMember = this.memberRepo.create({
      tontineId: saved.id,
      userId: createurId,
      tourOrdre: 1,
      aPayeTourActuel: false,
    });
    await this.memberRepo.save(creatorMember);

    return this.findOne(saved.id);
  }

  async findAll(): Promise<Tontine[]> {
    return this.tontineRepo.find({
      relations: ['membres', 'membres.user', 'createur'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Tontine> {
    const tontine = await this.tontineRepo.findOne({
      where: { id },
      relations: ['membres', 'membres.user', 'createur'],
    });
    if (!tontine) {
      throw new NotFoundException(`Tontine #${id} introuvable`);
    }
    return tontine;
  }

  async findByUser(userId: number): Promise<Tontine[]> {
    return this.tontineRepo
      .createQueryBuilder('t')
      .innerJoin('t.membres', 'm', 'm.userId = :userId', { userId })
      .leftJoinAndSelect('t.membres', 'allMembres')
      .leftJoinAndSelect('allMembres.user', 'user')
      .leftJoinAndSelect('t.createur', 'createur')
      .orderBy('t.createdAt', 'DESC')
      .getMany();
  }

  async update(id: number, dto: UpdateTontineDto, userId: number): Promise<Tontine> {
    const tontine = await this.findOne(id);
    if (tontine.createurId !== userId) {
      throw new ForbiddenException('Seul le créateur peut modifier cette tontine');
    }
    Object.assign(tontine, dto);
    return this.tontineRepo.save(tontine);
  }

  async remove(id: number, userId: number): Promise<void> {
    const tontine = await this.findOne(id);
    if (tontine.createurId !== userId) {
      throw new ForbiddenException('Seul le créateur peut supprimer cette tontine');
    }
    await this.tontineRepo.remove(tontine);
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
      tourOrdre: tontine.membres.length + 1,
      aPayeTourActuel: false,
    });
    return this.memberRepo.save(member);
  }
}
