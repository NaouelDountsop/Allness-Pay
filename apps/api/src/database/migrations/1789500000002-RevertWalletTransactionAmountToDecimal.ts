import { MigrationInterface, QueryRunner } from 'typeorm';

export class RevertWalletTransactionAmountToDecimal1789500000002 implements MigrationInterface {
  name = 'RevertWalletTransactionAmountToDecimal1789500000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convertir amount: bigint → numeric(18,2)
    await queryRunner.query(`
      ALTER TABLE wallet_transactions
      ALTER COLUMN amount TYPE numeric(18,2) USING CAST(amount AS numeric(18,2))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE wallet_transactions
      ALTER COLUMN amount TYPE bigint USING CAST(amount AS bigint)
    `);
  }
}
