import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBeneficiairesTable1787000000000 implements MigrationInterface {
  name = 'CreateBeneficiairesTable1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."beneficiaires_reseau_enum" AS ENUM(
          'ORANGE_MONEY', 'MTN_MOMO', 'MOOV_MONEY', 'WAVE', 'AFRILINKPAY', 'AUTRE'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE "beneficiaires" (
        "id"        uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id"  integer NOT NULL,
        "nom"       character varying NOT NULL,
        "numero"    character varying NOT NULL,
        "reseau"    "public"."beneficiaires_reseau_enum" NOT NULL,
        "pays"      character varying(2) NOT NULL,
        "verifie"   boolean NOT NULL DEFAULT false,
        "favori"    boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_beneficiaires_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_beneficiaires_owner_id"
          FOREIGN KEY ("owner_id") REFERENCES "utilisateur"("idutilisateur") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_beneficiaires_owner_numero"
        ON "beneficiaires" ("owner_id", "numero")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_beneficiaires_owner_numero"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "beneficiaires"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."beneficiaires_reseau_enum"`);
  }
}
