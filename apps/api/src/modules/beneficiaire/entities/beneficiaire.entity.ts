import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ReseauMobileMoney } from '../enums/reseau.enum';

@Entity('beneficiaires')
@Index(['owner', 'numero'], { unique: true })
export class Beneficiaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column()
  nom: string;

  @Column()
  numero: string;

  @Column({ type: 'enum', enum: ReseauMobileMoney })
  reseau: ReseauMobileMoney;

  @Column({ length: 2 })
  pays: string;

  @Column({ default: false })
  verifie: boolean;

  @Column({ default: false })
  favori: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Renvoie une version "API-friendly" avec des clés anglaises pour le frontend. */
  toApi() {
    const COUNTRY_TO_CURRENCY: Record<string, string> = {
      CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
      SN: 'XOF', CI: 'XOF', NE: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF',
      CA: 'CAD',
      FR: 'EUR', BE: 'EUR', CH: 'EUR', DE: 'EUR',
    };

    return {
      id: this.id,
      name: this.nom,
      phone: this.numero,
      network: this.reseau,
      country: this.pays,
      currency: COUNTRY_TO_CURRENCY[this.pays] ?? 'XAF',
      status: this.verifie ? 'verified' : 'pending',
      isFavorite: this.favori,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
