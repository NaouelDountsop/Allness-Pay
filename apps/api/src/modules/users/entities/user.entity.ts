import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Etat du compte utilisateur.
 *
 * Les valeurs sont en majuscules pour rester compatibles avec la donnee
 * existante : la colonne a pour defaut 'ACTIF' depuis la migration initiale.
 * Seul un compte ACTIF peut s'authentifier (voir `AuthService.assertUserActive`).
 */
export enum UserStatut {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  BLOQUE = 'BLOQUE',
  FERME = 'FERME',
}

@Entity('utilisateur')
export class User {
  @PrimaryGeneratedColumn()
  idutilisateur: number;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ type: 'date' })
  datenaissance: Date;

  @Column({ length: 10 })
  sexe: string;
  /*
  @Column({ length: 100 })
  nationalite: string; */

  @Column({ length: 100 })
  pays: string;

  @Column({ length: 100 })
  ville: string;

  @Column({ unique: true, length: 20 })
  telephone: string;

  @Column({ length: 255 })
  adresse: string;

  @Column({ unique: true })
  email: string;

  @Column()
  profession: string;

  @Column({ length: 255, select: false })
  motdepasse: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  // Le decorateur reste volontairement inchange (colonne `character varying`) :
  // le type TypeScript est resserre sans modifier le schema, donc sans migration.
  @Column({ default: UserStatut.ACTIF })
  statut: UserStatut;

  @Column({ type: 'boolean', default: false })
  verificationotp: boolean;

  @UpdateDateColumn()
  datemodification: Date;

  @CreateDateColumn()
  dateinscription: Date;
}
