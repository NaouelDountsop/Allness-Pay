import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUtilisateurTable1784889088160 implements MigrationInterface {
  name = 'CreateUtilisateurTable1784889088160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "utilisateur" ("idutilisateur" SERIAL NOT NULL, "nom" character varying(100) NOT NULL, "prenom" character varying(100) NOT NULL, "datenaissance" date NOT NULL, "sexe" character varying(10) NOT NULL, "pays" character varying(100) NOT NULL, "ville" character varying(100) NOT NULL, "telephone" character varying(20) NOT NULL, "adresse" character varying(255) NOT NULL, "email" character varying NOT NULL, "profession" character varying NOT NULL, "motdepasse" character varying(255) NOT NULL, "statut" character varying NOT NULL DEFAULT 'ACTIF', "dateinscription" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_80273015241cbddf8152908bd5b" UNIQUE ("telephone"), CONSTRAINT "UQ_e1136325a6b28e2a02b81b2f5e1" UNIQUE ("email"), CONSTRAINT "PK_2820a159aad68eba81b64757d58" PRIMARY KEY ("idutilisateur"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "utilisateur"`);
  }
}
