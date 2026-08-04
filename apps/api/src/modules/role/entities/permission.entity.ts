import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// Convention de nommage: 'ressource:action', ex: 'kyc:validate', 'roles:manage'.
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;
}