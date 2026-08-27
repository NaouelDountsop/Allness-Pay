import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQrCodeTokenToWallets1789000000000 implements MigrationInterface {
  name = 'AddQrCodeTokenToWallets1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wallets" ADD COLUMN "qrCodeToken" character varying(64)
    `);

    await queryRunner.query(`
      UPDATE "wallets" SET "qrCodeToken" = replace(replace(uuid_generate_v4()::text, '-', ''), '.', '') || replace(replace(uuid_generate_v4()::text, '-', ''), '.', '')
    `);

    await queryRunner.query(`
      ALTER TABLE "wallets" ALTER COLUMN "qrCodeToken" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_wallets_qrCodeToken" ON "wallets" ("qrCodeToken")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_wallets_qrCodeToken"`);
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN IF EXISTS "qrCodeToken"`);
  }
}
