import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum IdentityDocumentType {
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
}

export enum ProofOfAddressType {
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT',
  RESIDENCE_CERTIFICATE = 'RESIDENCE_CERTIFICATE',
}

@Entity('kyc')
export class Kyc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'enum', enum: IdentityDocumentType })
  IdentityDocumentType: IdentityDocumentType;

  @Column({ type: 'enum', enum: ProofOfAddressType })
  proofOfAddressType: ProofOfAddressType;

  @Column({ length: 2048 })
  documentFrontUrl: string;

  @Column({ length: 2048, nullable: true })
  documentBackUrl?: string;

  @Column({ length: 2048 })
  selfieUrl: string;

  @Column({ length: 2048 })
  proofOfAddressUrl: string;

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.PENDING })
  status: KycStatus;

  @Column({ type: 'text', nullable: true })
  reviewComment?: string;

  @Column({ type: 'int', nullable: true })
  verifiedBy?: number;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}