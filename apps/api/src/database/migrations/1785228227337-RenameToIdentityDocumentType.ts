import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameToIdentityDocumentType1785228227337 implements MigrationInterface {
    name = 'RenameToIdentityDocumentType1785228227337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" RENAME COLUMN "documentType" TO "IdentityDocumentType"`);
        await queryRunner.query(`ALTER TYPE "public"."kyc_documenttype_enum" RENAME TO "kyc_identitydocumenttype_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."kyc_identitydocumenttype_enum" RENAME TO "kyc_documenttype_enum"`);
        await queryRunner.query(`ALTER TABLE "kyc" RENAME COLUMN "IdentityDocumentType" TO "documentType"`);
    }

}
