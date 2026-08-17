import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Currency } from './currency.entity';

@Entity('exchange_rates')
@Index(['fromCurrencyCode', 'toCurrencyCode'], { unique: true })
export class ExchangeRate extends BaseEntity {
  @Column({ type: 'varchar', length: 3 })
  fromCurrencyCode: string;

  @ManyToOne(() => Currency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromCurrencyCode', referencedColumnName: 'code' })
  fromCurrency: Currency;

  @Column({ type: 'varchar', length: 3 })
  toCurrencyCode: string;

  @ManyToOne(() => Currency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toCurrencyCode', referencedColumnName: 'code' })
  toCurrency: Currency;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  rate: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
