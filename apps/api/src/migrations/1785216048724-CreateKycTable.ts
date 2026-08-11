import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKycTable1785216048724 implements MigrationInterface {
  name = 'CreateKycTable1785216048724';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentType"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_documenttype_enum"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentFrontUrl"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentBackUrl"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "selfieUrl"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "proofOfAddressUrl"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentNumber"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentExpiryDate"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "documentCountry"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "proofOfAddressType"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_proofofaddresstype_enum"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_status_enum"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "reviewComment"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "verifiedAt"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "verifiedBy"`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "idUtilisateur" integer NOT NULL`);
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_typedocument_enum" AS ENUM('CARTE_IDENTITE', 'PASSEPORT', 'PERMIS_CONDUIRE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "typeDocument" "public"."kyc_typedocument_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_typejustificatifdomicile_enum" AS ENUM('FACTURE', 'RELEVE_BANCAIRE', 'CERTIFICAT_RESIDENCE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "typeJustificatifDomicile" "public"."kyc_typejustificatifdomicile_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "urlRectoDocument" character varying(2048) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "kyc" ADD "urlVersoDocument" character varying(2048)`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "urlSelfie" character varying(2048) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "urlJustificatifDomicile" character varying(2048) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_statut_enum" AS ENUM('EN_ATTENTE', 'APPROUVE', 'REJETE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "statut" "public"."kyc_statut_enum" NOT NULL DEFAULT 'EN_ATTENTE'`,
    );
    await queryRunner.query(`ALTER TABLE "kyc" ADD "commentaireExamen" text`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "verifiePar" integer`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "verifieLe" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "creeLe" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "misAJourLe" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "misAJourLe"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "creeLe"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "verifieLe"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "verifiePar"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "commentaireExamen"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "statut"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_statut_enum"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "urlJustificatifDomicile"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "urlSelfie"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "urlVersoDocument"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "urlRectoDocument"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "typeJustificatifDomicile"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_typejustificatifdomicile_enum"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "typeDocument"`);
    await queryRunner.query(`DROP TYPE "public"."kyc_typedocument_enum"`);
    await queryRunner.query(`ALTER TABLE "kyc" DROP COLUMN "idUtilisateur"`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "verifiedBy" integer`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "userId" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "kyc" ADD "verifiedAt" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "reviewComment" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "status" "public"."kyc_status_enum" NOT NULL DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_proofofaddresstype_enum" AS ENUM('UTILITY_BILL', 'BANK_STATEMENT', 'RESIDENCE_CERTIFICATE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "proofOfAddressType" "public"."kyc_proofofaddresstype_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentCountry" character varying`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentExpiryDate" date`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentNumber" character varying`);
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "proofOfAddressUrl" character varying(2048) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "kyc" ADD "selfieUrl" character varying(2048) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "kyc" ADD "documentBackUrl" character varying(2048)`);
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "documentFrontUrl" character varying(2048) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."kyc_documenttype_enum" AS ENUM('NATIONAL_ID', 'PASSPORT', 'DRIVER_LICENSE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "kyc" ADD "documentType" "public"."kyc_documenttype_enum" NOT NULL`,
    );
  }
}
