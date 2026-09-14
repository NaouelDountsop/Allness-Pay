import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivatedAtToTontineCycles1790000000000 implements MigrationInterface {
  name = 'AddActivatedAtToTontineCycles1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tontine_cycles" ADD COLUMN "activatedAt" timestamptz
    `);

    await queryRunner.query(`
      UPDATE "tontine_cycles" SET "activatedAt" = "createdAt" WHERE "status" = 'ACTIVE' OR "status" = 'COMPLETED' OR "status" = 'FAILED'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tontine_cycles" DROP COLUMN IF EXISTS "activatedAt"`);
  }
}
