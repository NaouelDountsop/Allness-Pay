import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTontineTables1785750000000 implements MigrationInterface {
  name = 'CreateTontineTables1785750000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."tontine_frequency_enum" AS ENUM('Hebdomadaire', 'Mensuelle')`);
    await queryRunner.query(`CREATE TYPE "public"."tontine_status_enum" AS ENUM('active', 'paused', 'completed', 'cancelled')`);

    await queryRunner.query(`
      CREATE TABLE "tontines" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" character varying(255),
        "montantCotisation" bigint NOT NULL,
        "frequence" "public"."tontine_frequency_enum" NOT NULL DEFAULT 'Mensuelle',
        "nombreMembres" integer NOT NULL DEFAULT 12,
        "statut" "public"."tontine_status_enum" NOT NULL DEFAULT 'active',
        "tourActuel" integer NOT NULL DEFAULT 0,
        "devise" character varying NOT NULL DEFAULT 'XAF',
        "lieu" character varying,
        "createurId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tontines_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tontine_members" (
        "id" SERIAL NOT NULL,
        "tontineId" integer NOT NULL,
        "userId" integer NOT NULL,
        "tourOrdre" integer NOT NULL DEFAULT 0,
        "aPayeTourActuel" boolean NOT NULL DEFAULT false,
        "dateRejoint" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tontine_members_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tontines"
      ADD CONSTRAINT "FK_tontines_createurId"
      FOREIGN KEY ("createurId") REFERENCES "utilisateur"("idutilisateur")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tontine_members"
      ADD CONSTRAINT "FK_tontine_members_tontineId"
      FOREIGN KEY ("tontineId") REFERENCES "tontines"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tontine_members"
      ADD CONSTRAINT "FK_tontine_members_userId"
      FOREIGN KEY ("userId") REFERENCES "utilisateur"("idutilisateur")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`CREATE INDEX "IDX_tontines_createurId" ON "tontines" ("createurId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tontine_members_tontineId" ON "tontine_members" ("tontineId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tontine_members_userId" ON "tontine_members" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tontine_members" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tontines" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tontine_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tontine_frequency_enum"`);
  }
}
