import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLinkedAccounts1785700000000 implements MigrationInterface {
    name = 'AddLinkedAccounts1785700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."linked_accounts_type_enum" AS ENUM('bank_account', 'mobile_money')`);
        await queryRunner.query(`CREATE TYPE "public"."linked_accounts_operator_enum" AS ENUM('mtn_momo', 'orange_money', 'wave', 'free_money', 'moov_money', 'airtel_money', 'bank_app', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."linked_accounts_status_enum" AS ENUM('pending', 'active', 'suspended', 'removed')`);

        await queryRunner.query(`
            CREATE TABLE "linked_accounts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" integer NOT NULL,
                "type" "public"."linked_accounts_type_enum" NOT NULL,
                "operator" "public"."linked_accounts_operator_enum" NOT NULL,
                "label" character varying(100) NOT NULL,
                "phoneNumber" character varying(50),
                "accountNumber" character varying(50),
                "bankName" character varying(100),
                "iban" character varying(50),
                "swiftCode" character varying(20),
                "currency" character varying(20) NOT NULL DEFAULT 'XAF',
                "status" "public"."linked_accounts_status_enum" NOT NULL DEFAULT 'pending',
                "isDefault" boolean NOT NULL DEFAULT false,
                "verificationToken" text,
                "verifiedAt" TIMESTAMP,
                "failedVerificationAttempts" integer NOT NULL DEFAULT '0',
                "lockedUntil" TIMESTAMP,
                "externalAccountId" character varying(255),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_linked_accounts_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`CREATE INDEX "IDX_linked_accounts_userId" ON "linked_accounts" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_linked_accounts_status" ON "linked_accounts" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_linked_accounts_type" ON "linked_accounts" ("type")`);

        await queryRunner.query(`ALTER TABLE "linked_accounts" ADD CONSTRAINT "FK_linked_accounts_userId" FOREIGN KEY ("userId") REFERENCES "utilisateur"("idutilisateur") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "linked_accounts" DROP CONSTRAINT "FK_linked_accounts_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_linked_accounts_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_linked_accounts_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_linked_accounts_userId"`);
        await queryRunner.query(`DROP TABLE "linked_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."linked_accounts_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."linked_accounts_operator_enum"`);
        await queryRunner.query(`DROP TYPE "public"."linked_accounts_type_enum"`);
    }
}
