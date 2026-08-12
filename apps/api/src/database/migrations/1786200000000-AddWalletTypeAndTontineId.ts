import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWalletTypeAndTontineId1786200000000 implements MigrationInterface {
  name = 'AddWalletTypeAndTontineId1786200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer l'enum WalletType
    await queryRunner.query(
      `CREATE TYPE "public"."wallets_type_enum" AS ENUM('PERSONAL', 'TONTINE')`,
    );

    // Ajouter les colonnes type et tontineId aux wallets
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "type" "public"."wallets_type_enum" NOT NULL DEFAULT 'PERSONAL'`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" ADD "tontineId" uuid`);

    // Corriger la FK walletId sur tontines : pointer vers wallets au lieu de utilisateur
    // (supprimer l'ancienne contrainte si elle existe encore)
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_fa226ae0f4779e130fc05264e82') THEN ALTER TABLE "tontines" DROP CONSTRAINT "FK_fa226ae0f4779e130fc05264e82"; END IF; END $$`,
    );

    // Ajouter la nouvelle contrainte FK vers wallets
    await queryRunner.query(
      `ALTER TABLE "tontines" ADD CONSTRAINT "FK_tontines_walletId"
       FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la FK sur tontines
    await queryRunner.query(
      `ALTER TABLE "tontines" DROP CONSTRAINT IF EXISTS "FK_tontines_walletId"`,
    );

    // Supprimer les colonnes
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "tontineId"`);
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "type"`);

    // Supprimer l'enum
    await queryRunner.query(`DROP TYPE "public"."wallets_type_enum"`);
  }
}
