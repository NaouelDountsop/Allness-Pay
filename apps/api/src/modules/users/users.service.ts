import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hash, verify } from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, telephone, motdepasse, datenaissance, profession, ...rest } = createUserDto;

    
    const existing = await this.usersRepository.findOne({
        where: [{ email }, { telephone }],
    });
    
    
    if (existing) {
        throw new ConflictException('Email ou téléphone déjà utilisé, veuillez entrer un inexistant.');
    }
    
    const user = this.usersRepository.create({
      ...rest,
      email,
      telephone,
      profession,
      datenaissance: new Date(datenaissance),
      motdepasse: await hash(motdepasse),
    });

    const saved = await this.usersRepository.save(user);
    return saved;
  }

  findAll() : Promise<User []> {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { idutilisateur: id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (updateUserDto.motdepasse) {
      updateUserDto.motdepasse = await hash(updateUserDto.motdepasse);
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) return null;

    const valid = await verify(user.motdepasse, password);
    return valid ? user : null;
  }
}