import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * Socle commun a toutes les entites persistantes.
 *
 * - identifiant UUID : non devinable, ne revele pas le volume d'activite ;
 * - horodatages `timestamptz` : jamais de date sans fuseau ;
 * - suppression logique : aucune donnee financiere n'est effacee physiquement ;
 * - `version` : verrouillage optimiste contre les ecritures concurrentes.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @VersionColumn({ name: 'version', default: 1 })
  version!: number;
}

/**
 * Variante auditee, pour les tables ou l'on doit pouvoir repondre a la question
 * « qui a modifie cette ligne ? » — exigence de conformite.
 */
export abstract class AuditedEntity extends BaseEntity {
  createdBy?: string | null;
  updatedBy?: string | null;
}
