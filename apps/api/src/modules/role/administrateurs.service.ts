import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'argon2';
import { Administrateur } from './entities/administrateur.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

export type AdminWithoutPassword = Omit<Administrateur, 'motdepasse'>;

@Injectable()
export class AdministrateursService {
  constructor(
    @InjectRepository(Administrateur)
    private readonly adminRepo: Repository<Administrateur>,
  ) {}

  async create(dto: CreateAdminDto): Promise<AdminWithoutPassword> {
    const existing = await this.adminRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const admin = this.adminRepo.create({
      nom: dto.nom,
      email: dto.email,
      motdepasse: await hash(dto.motdepasse),
    });

    const saved = await this.adminRepo.save(admin);
    const { motdepasse: _, ...result } = saved as Administrateur & { motdepasse: string };
    return result;
  }

  async findAll(): Promise<AdminWithoutPassword[]> {
    return this.adminRepo.find({
      select: ['id', 'nom', 'email', 'statut', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: number): Promise<AdminWithoutPassword> {
    const admin = await this.adminRepo.findOne({
      where: { id },
      select: ['id', 'nom', 'email', 'statut', 'createdAt', 'updatedAt'],
    });
    if (!admin) {
      throw new NotFoundException('Administrateur introuvable');
    }
    return admin;
  }

  async update(id: number, dto: UpdateAdminDto): Promise<AdminWithoutPassword> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Administrateur introuvable');
    }

    if (dto.email && dto.email !== admin.email) {
      const existing = await this.adminRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    Object.assign(admin, dto);
    const saved = await this.adminRepo.save(admin);
    const { motdepasse: _, ...result } = saved as Administrateur & { motdepasse: string };
    return result;
  }

  async remove(id: number): Promise<void> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Administrateur introuvable');
    }
    await this.adminRepo.remove(admin);
  }
}
