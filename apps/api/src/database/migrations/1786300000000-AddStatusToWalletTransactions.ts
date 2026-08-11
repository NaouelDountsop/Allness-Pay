import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToWalletTransactions1786300000000 implements MigrationInterface {
    name = 'AddStatusToWalletTransactions1786300000000'

    public async up(_queryRunner: QueryRunner): Promise<void> {
        // Créer l'enum status s'il n'existe pas déjà
        await _queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."wallet_transactions_status_enum" AS ENUM('pending', 'completed', 'failed', 'cancelled');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Ajouter la colonne status si elle n'existe pas
        await _queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "wallet_transactions" ADD "status" "public"."wallet_transactions_status_enum" NOT NULL DEFAULT 'completed';
            EXCEPTION
                WHEN duplicate_column THEN null;
            END $$;
        `);

        // Mettre à jour les transactions existantes avec status = 'completed'
        await _queryRunner.query(`
            UPDATE "wallet_transactions" SET "status" = 'completed' WHERE "status" IS NULL;
        `);
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        await _queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN IF EXISTS "status"`);
        await _queryRunner.query(`DROP TYPE IF EXISTS "public"."wallet_transactions_status_enum"`);
    }
}
