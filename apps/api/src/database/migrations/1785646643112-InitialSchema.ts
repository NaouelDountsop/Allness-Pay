import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785646643112 implements MigrationInterface {
    name = 'InitialSchema1785646643112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "utilisateur" ("idutilisateur" SERIAL NOT NULL, "nom" character varying(100) NOT NULL, "prenom" character varying(100) NOT NULL, "datenaissance" date NOT NULL, "sexe" character varying(10) NOT NULL, "pays" character varying(100) NOT NULL, "ville" character varying(100) NOT NULL, "telephone" character varying(20) NOT NULL, "adresse" character varying(255) NOT NULL, "email" character varying NOT NULL, "profession" character varying NOT NULL, "motdepasse" character varying(255) NOT NULL, "googleId" character varying, "statut" character varying NOT NULL DEFAULT 'ACTIF', "verificationotp" boolean NOT NULL DEFAULT false, "datemodification" TIMESTAMP NOT NULL DEFAULT now(), "dateinscription" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_80273015241cbddf8152908bd5b" UNIQUE ("telephone"), CONSTRAINT "UQ_e1136325a6b28e2a02b81b2f5e1" UNIQUE ("email"), CONSTRAINT "UQ_b07debc3c9da23863cf01fe7a90" UNIQUE ("googleId"), CONSTRAINT "PK_2820a159aad68eba81b64757d58" PRIMARY KEY ("idutilisateur"))`);
        await queryRunner.query(`CREATE TYPE "public"."wallets_status_enum" AS ENUM('active', 'suspended', 'closed')`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "walletNumber" character varying NOT NULL, "userId" integer NOT NULL, "balance" bigint NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'XAF', "status" "public"."wallets_status_enum" NOT NULL DEFAULT 'active', "isPrimary" boolean NOT NULL DEFAULT false, "label" character varying, "pinHash" character varying, "pinCreatedAt" TIMESTAMP, "failedPinAttempts" integer NOT NULL DEFAULT '0', "lockedUntil" TIMESTAMP, "version" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4f18b2dd66fee782bd5acbab08f" UNIQUE ("walletNumber"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2ecdb33f23e9a6fc392025c0b9" ON "wallets" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."wallet_transactions_type_enum" AS ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out')`);
        await queryRunner.query(`CREATE TABLE "wallet_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "walletId" uuid NOT NULL, "type" "public"."wallet_transactions_type_enum" NOT NULL, "amount" bigint NOT NULL, "relatedWalletId" uuid, "reference" character varying, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8a94d9d61a2b05123710b325fb" ON "wallet_transactions" ("walletId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9a4948382b69074d96e842e8fa" ON "wallet_transactions" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_5f90b0972a69334dfc7ff9c8ea" ON "wallet_transactions" ("walletId", "createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."tontine_members_role_enum" AS ENUM('ADMIN', 'MEMBER')`);
        await queryRunner.query(`CREATE TYPE "public"."tontine_members_status_enum" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'LEFT', 'REMOVED')`);
        await queryRunner.query(`CREATE TABLE "tontine_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tontineId" uuid NOT NULL, "userId" integer NOT NULL, "role" "public"."tontine_members_role_enum" NOT NULL DEFAULT 'MEMBER', "status" "public"."tontine_members_status_enum" NOT NULL DEFAULT 'PENDING', "beneficiaryOrder" integer, "hasReceivedPayout" boolean NOT NULL DEFAULT false, "missedContributions" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ce19bf19aa8305318d5dcf6b613" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tontine_contributions_status_enum" AS ENUM('PENDING', 'PAID', 'LATE', 'FAILED', 'REFUNDED')`);
        await queryRunner.query(`CREATE TABLE "tontine_contributions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cycleId" uuid NOT NULL, "memberId" uuid NOT NULL, "amount" bigint NOT NULL, "status" "public"."tontine_contributions_status_enum" NOT NULL DEFAULT 'PENDING', "walletTransactionId" uuid, "paidAt" TIMESTAMP WITH TIME ZONE, "dueDate" TIMESTAMP WITH TIME ZONE, "penaltyCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_701b6ad102d93129a36e690745a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tontine_cycles_status_enum" AS ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "tontine_cycles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tontineId" uuid NOT NULL, "cycleNumber" integer NOT NULL, "beneficiaryId" uuid NOT NULL, "status" "public"."tontine_cycles_status_enum" NOT NULL DEFAULT 'PENDING', "totalPot" bigint NOT NULL, "collectedAmount" bigint NOT NULL DEFAULT '0', "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL, "completedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d76cc943c78a115d77bf5847c50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tontines_frequency_enum" AS ENUM('WEEKLY', 'BIWEEKLY', 'MONTHLY')`);
        await queryRunner.query(`CREATE TYPE "public"."tontines_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "tontines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "description" character varying(500), "targetAmount" bigint NOT NULL, "contributionAmount" bigint NOT NULL, "memberLimit" integer NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'XAF', "frequency" "public"."tontines_frequency_enum" NOT NULL, "status" "public"."tontines_status_enum" NOT NULL DEFAULT 'DRAFT', "currentCycle" integer NOT NULL DEFAULT '0', "nextContributionAt" TIMESTAMP WITH TIME ZONE, "creatorId" integer NOT NULL, "walletId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "REL_fa226ae0f4779e130fc05264e8" UNIQUE ("walletId"), CONSTRAINT "PK_e2ba1a485e389feb1e552d44b06" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tontine_invitations_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "tontine_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tontineId" uuid NOT NULL, "inviterUserId" integer NOT NULL, "inviteeUserId" integer, "inviteeEmail" character varying(255), "token" character varying(100) NOT NULL, "status" "public"."tontine_invitations_status_enum" NOT NULL DEFAULT 'PENDING', "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9378d9258b729f732b0e583743c" UNIQUE ("token"), CONSTRAINT "PK_b50cabf30ed8d6de4a02ed9c745" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."administrateurs_statut_enum" AS ENUM('actif', 'suspendu')`);
        await queryRunner.query(`CREATE TABLE "administrateurs" ("id" SERIAL NOT NULL, "nom" character varying NOT NULL, "email" character varying NOT NULL, "motdepasse" character varying NOT NULL, "statut" "public"."administrateurs_statut_enum" NOT NULL DEFAULT 'actif', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7a1e306296472395b9d1e0f48de" UNIQUE ("email"), CONSTRAINT "PK_1368a340689c4b82150d3dbfe50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminId" integer NOT NULL, "roleId" uuid NOT NULL, "assignedBy" integer, "assignedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_67395220ef147312a68be2e8b94" UNIQUE ("adminId", "roleId"), CONSTRAINT "PK_091baca34754e848b9f8c4e7be9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."kyc_identitydocumenttype_enum" AS ENUM('NATIONAL_ID', 'PASSPORT', 'DRIVER_LICENSE')`);
        await queryRunner.query(`CREATE TYPE "public"."kyc_proofofaddresstype_enum" AS ENUM('UTILITY_BILL', 'BANK_STATEMENT', 'RESIDENCE_CERTIFICATE')`);
        await queryRunner.query(`CREATE TYPE "public"."kyc_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "kyc" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "IdentityDocumentType" "public"."kyc_identitydocumenttype_enum" NOT NULL, "proofOfAddressType" "public"."kyc_proofofaddresstype_enum" NOT NULL, "documentFrontUrl" character varying(2048) NOT NULL, "documentBackUrl" character varying(2048), "selfieUrl" character varying(2048) NOT NULL, "proofOfAddressUrl" character varying(2048) NOT NULL, "status" "public"."kyc_status_enum" NOT NULL DEFAULT 'PENDING', "reviewComment" text, "verifiedBy" integer, "verifiedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_84ab2e81ea9700d29dda719f3be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("roleId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "utilisateur"("idutilisateur") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_9f729fd7a097731ad0d80a55401" FOREIGN KEY ("relatedWalletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tontine_members" ADD CONSTRAINT "FK_915c2366d8e0361da088d004f1d" FOREIGN KEY ("tontineId") REFERENCES "tontines"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tontine_contributions" ADD CONSTRAINT "FK_3cf900ee567f801bd886e22e72c" FOREIGN KEY ("cycleId") REFERENCES "tontine_cycles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tontine_cycles" ADD CONSTRAINT "FK_7737d881c42db78d4a3cc1be51a" FOREIGN KEY ("tontineId") REFERENCES "tontines"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tontines" ADD CONSTRAINT "FK_fa226ae0f4779e130fc05264e82" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tontine_invitations" ADD CONSTRAINT "FK_06b400c5c042020c33933379763" FOREIGN KEY ("tontineId") REFERENCES "tontines"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_roles" ADD CONSTRAINT "FK_99157dcf6bebe887c615e879f85" FOREIGN KEY ("adminId") REFERENCES "administrateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_roles" ADD CONSTRAINT "FK_19708b93e7167e5070026524914" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`);
        await queryRunner.query(`ALTER TABLE "admin_roles" DROP CONSTRAINT "FK_19708b93e7167e5070026524914"`);
        await queryRunner.query(`ALTER TABLE "admin_roles" DROP CONSTRAINT "FK_99157dcf6bebe887c615e879f85"`);
        await queryRunner.query(`ALTER TABLE "tontine_invitations" DROP CONSTRAINT "FK_06b400c5c042020c33933379763"`);
        await queryRunner.query(`ALTER TABLE "tontines" DROP CONSTRAINT "FK_fa226ae0f4779e130fc05264e82"`);
        await queryRunner.query(`ALTER TABLE "tontine_cycles" DROP CONSTRAINT "FK_7737d881c42db78d4a3cc1be51a"`);
        await queryRunner.query(`ALTER TABLE "tontine_contributions" DROP CONSTRAINT "FK_3cf900ee567f801bd886e22e72c"`);
        await queryRunner.query(`ALTER TABLE "tontine_members" DROP CONSTRAINT "FK_915c2366d8e0361da088d004f1d"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_9f729fd7a097731ad0d80a55401"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "kyc"`);
        await queryRunner.query(`DROP TYPE "public"."kyc_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."kyc_proofofaddresstype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."kyc_identitydocumenttype_enum"`);
        await queryRunner.query(`DROP TABLE "admin_roles"`);
        await queryRunner.query(`DROP TABLE "administrateurs"`);
        await queryRunner.query(`DROP TYPE "public"."administrateurs_statut_enum"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "tontine_invitations"`);
        await queryRunner.query(`DROP TYPE "public"."tontine_invitations_status_enum"`);
        await queryRunner.query(`DROP TABLE "tontines"`);
        await queryRunner.query(`DROP TYPE "public"."tontines_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tontines_frequency_enum"`);
        await queryRunner.query(`DROP TABLE "tontine_cycles"`);
        await queryRunner.query(`DROP TYPE "public"."tontine_cycles_status_enum"`);
        await queryRunner.query(`DROP TABLE "tontine_contributions"`);
        await queryRunner.query(`DROP TYPE "public"."tontine_contributions_status_enum"`);
        await queryRunner.query(`DROP TABLE "tontine_members"`);
        await queryRunner.query(`DROP TYPE "public"."tontine_members_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tontine_members_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f90b0972a69334dfc7ff9c8ea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a4948382b69074d96e842e8fa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a94d9d61a2b05123710b325fb"`);
        await queryRunner.query(`DROP TABLE "wallet_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transactions_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ecdb33f23e9a6fc392025c0b9"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TYPE "public"."wallets_status_enum"`);
        await queryRunner.query(`DROP TABLE "utilisateur"`);
    }

}
