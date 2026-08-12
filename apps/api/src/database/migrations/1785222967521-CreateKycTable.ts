import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKycTable1785222967521 implements MigrationInterface {
  name = 'CreateKycTable1785222967521';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_documenttype_enum" AS ENUM('NATIONAL_ID', 'PASSPORT', 'DRIVER_LICENSE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_proofofaddresstype_enum" AS ENUM('UTILITY_BILL', 'BANK_STATEMENT', 'RESIDENCE_CERTIFICATE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "kyc" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "documentType" "public"."kyc_documenttype_enum" NOT NULL, "proofOfAddressType" "public"."kyc_proofofaddresstype_enum" NOT NULL, "documentFrontUrl" character varying(2048) NOT NULL, "documentBackUrl" character varying(2048), "selfieUrl" character varying(2048) NOT NULL, "proofOfAddressUrl" character varying(2048) NOT NULL, "status" "public"."kyc_status_enum" NOT NULL DEFAULT 'PENDING', "reviewComment" text, "verifiedBy" integer, "verifiedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_84ab2e81ea9700d29dda719f3be" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "utilisateur" DROP COLUMN "datemodification"`);
    await queryRunner.query(`ALTER TABLE "utilisateur" DROP COLUMN "verificationotp"`);
    await queryRunner.query(`DROP TABLE "kyc"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_proofofaddresstype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_documenttype_enum"`);
  }
}
