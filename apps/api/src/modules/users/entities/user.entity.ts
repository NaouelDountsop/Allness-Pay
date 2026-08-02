import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


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

  @Column({ length:10 })
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

  @Column({ default: 'ACTIF' })
  statut: string;

  @Column({ type: 'boolean', default: false })
  verificationotp: boolean;

  @UpdateDateColumn()
  datemodification: Date;

  @CreateDateColumn()
  dateinscription: Date;


}
