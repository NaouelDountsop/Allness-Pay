import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Role } from './role.entity';
import { Administrateur } from './administrateur.entity';

// Un administrateur peut avoir plusieurs rôles (ex: "agent" + "support").
// Les clients (Utilisateur) n'ont jamais de ligne ici : le RBAC ne concerne
// que le back-office.
@Entity('admin_roles')
@Unique(['adminId', 'roleId'])
export class AdminRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  adminId: number;

  @Column()
  roleId: number;

  @ManyToOne(() => Administrateur, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: Administrateur;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  // Quel administrateur a attribué ce rôle — traçabilité pour l'audit.
  @Column({ type: 'int', nullable: true })
  assignedBy: number | null;

  @CreateDateColumn()
  assignedAt: Date;
}