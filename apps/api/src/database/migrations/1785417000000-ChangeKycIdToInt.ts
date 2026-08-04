import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeKycIdToInt1785417000000 implements MigrationInterface {
    name = 'ChangeKycIdToInt1785417000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la table kyc existante (UUID) et la recréer avec un id entier
        await queryRunner.query(`DROP TABLE IF EXISTS "kyc" CASCADE`);
        await queryRunner.query(`CREATE TABLE "kyc" (
            "id" SERIAL NOT NULL,
            "userId" integer NOT NULL,
            "IdentityDocumentType" "public"."kyc_identitydocumenttype_enum" NOT NULL,
            "proofOfAddressType" "public"."kyc_proofofaddresstype_enum" NOT NULL,
            "documentFrontUrl" character varying(2048) NOT NULL,
            "documentBackUrl" character varying(2048),
            "selfieUrl" character varying(2048) NOT NULL,
            "proofOfAddressUrl" character varying(2048) NOT NULL,
            "status" "public"."kyc_status_enum" NOT NULL DEFAULT 'PENDING',
            "reviewComment" text,
            "verifiedBy" integer,
            "verifiedAt" TIMESTAMP WITH TIME ZONE,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_kyc_id" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "IDX_kyc_userId" ON "kyc" ("userId")`);
        await queryRunner.query(`ALTER TABLE "kyc" ADD CONSTRAINT "FK_kyc_userId" FOREIGN KEY ("userId") REFERENCES "utilisateur"("idutilisateur") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc" DROP CONSTRAINT IF EXISTS "FK_kyc_userId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "kyc"`);
        // Recréer avec UUID comme avant
        await queryRunner.query(`CREATE TABLE "kyc" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "userId" integer NOT NULL,
            "IdentityDocumentType" "public"."kyc_documenttype_enum" NOT NULL,
            "proofOfAddressType" "public"."kyc_proofofaddresstype_enum" NOT NULL,
            "documentFrontUrl" character varying(2048) NOT NULL,
            "documentBackUrl" character varying(2048),
            "selfieUrl" character varying(2048) NOT NULL,
            "proofOfAddressUrl" character varying(2048) NOT NULL,
            "status" "public"."kyc_status_enum" NOT NULL DEFAULT 'PENDING',
            "reviewComment" text,
            "verifiedBy" integer,
            "verifiedAt" TIMESTAMP WITH TIME ZONE,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_84ab2e81ea9700d29dda719f3be" PRIMARY KEY ("id")
        )`);
    }
}
