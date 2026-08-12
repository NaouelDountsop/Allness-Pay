import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKycTable1785153780506 implements MigrationInterface {
  name = 'CreateKycTable1785153780506';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentNumber"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentExpiryDate"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentCountry"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentCountry" character varying`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentExpiryDate" date`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentNumber" character varying`);
  }
}
