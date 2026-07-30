import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdministrateurStatut {
  ACTIF = 'actif',
  SUSPENDU = 'suspendu',
}

@Entity('administrateurs')
export class Administrateur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ unique: true })
  email: string;

  // Mot de passe de connexion au back-office, distinct de celui des clients.
  @Column({ select: false })
  motdepasse: string;

  @Column({ type: 'enum', enum: AdministrateurStatut, default: AdministrateurStatut.ACTIF })
  statut: AdministrateurStatut;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}