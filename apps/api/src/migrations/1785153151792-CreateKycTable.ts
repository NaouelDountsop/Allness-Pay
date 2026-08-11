import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKycTable1785153151792 implements MigrationInterface {
  name = 'CreateKycTable1785153151792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentExpiryDate"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentCountry"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentCountry" character varying`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentExpiryDate" date`);
  }
}
