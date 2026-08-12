import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOperatorAndPhoneToWalletTransactions1786100000000 implements MigrationInterface {
  name = 'AddOperatorAndPhoneToWalletTransactions1786100000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Créer l'enum operator s'il n'existe pas déjà
    await _queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."wallet_transactions_operator_enum" AS ENUM('mtn_momo', 'orange_money', 'wave', 'free_money', 'moov_money', 'airtel_money', 'bank_app', 'other');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    // Ajouter la colonne operator si elle n'existe pas
    await _queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "wallet_transactions" ADD "operator" "public"."wallet_transactions_operator_enum";
            EXCEPTION
                WHEN duplicate_column THEN null;
            END $$;
        `);

    // Ajouter la colonne phoneNumber si elle n'existe pas
    await _queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "wallet_transactions" ADD "phoneNumber" character varying;
            EXCEPTION
                WHEN duplicate_column THEN null;
            END $$;
        `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    await _queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN IF EXISTS "phoneNumber"`,
    );
    await _queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN IF EXISTS "operator"`);
    await _queryRunner.query(`DROP TYPE IF EXISTS "public"."wallet_transactions_operator_enum"`);
  }
}
