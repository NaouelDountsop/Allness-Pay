import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('currencies')
export class Currency extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 3 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({ type: 'int', default: 2 })
  decimals: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  flag: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
