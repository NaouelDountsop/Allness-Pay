import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingTables1785406795523 implements MigrationInterface {
  name = 'AddMissingTables1785406795523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_type_enum" AS ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out')`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "walletId" uuid NOT NULL, "type" "public"."wallet_transactions_type_enum" NOT NULL, "amount" bigint NOT NULL, "relatedWalletId" uuid, "reference" character varying, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a94d9d61a2b05123710b325fb" ON "wallet_transactions" ("walletId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a4948382b69074d96e842e8fa" ON "wallet_transactions" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f90b0972a69334dfc7ff9c8ea" ON "wallet_transactions" ("walletId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."administrateurs_statut_enum" AS ENUM('actif', 'suspendu')`,
    );
    await queryRunner.query(
      `CREATE TABLE "administrateurs" ("id" SERIAL NOT NULL, "nom" character varying NOT NULL, "email" character varying NOT NULL, "motdepasse" character varying NOT NULL, "statut" "public"."administrateurs_statut_enum" NOT NULL DEFAULT 'actif', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7a1e306296472395b9d1e0f48de" UNIQUE ("email"), CONSTRAINT "PK_1368a340689c4b82150d3dbfe50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminId" integer NOT NULL, "roleId" uuid NOT NULL, "assignedBy" integer, "assignedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_67395220ef147312a68be2e8b94" UNIQUE ("adminId", "roleId"), CONSTRAINT "PK_091baca34754e848b9f8c4e7be9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("roleId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId") `,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "balance"`);
    await queryRunner.query(`ALTER TABLE "wallets" ADD "balance" bigint NOT NULL DEFAULT '0'`);
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_9f729fd7a097731ad0d80a55401" FOREIGN KEY ("relatedWalletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_roles" ADD CONSTRAINT "FK_99157dcf6bebe887c615e879f85" FOREIGN KEY ("adminId") REFERENCES "administrateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_roles" ADD CONSTRAINT "FK_19708b93e7167e5070026524914" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_roles" DROP CONSTRAINT "FK_19708b93e7167e5070026524914"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_roles" DROP CONSTRAINT "FK_99157dcf6bebe887c615e879f85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_9f729fd7a097731ad0d80a55401"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "balance"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "balance" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "admin_roles"`);
    await queryRunner.query(`DROP TABLE "administrateurs"`);
    await queryRunner.query(`DROP TYPE "public"."administrateurs_statut_enum"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5f90b0972a69334dfc7ff9c8ea"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9a4948382b69074d96e842e8fa"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8a94d9d61a2b05123710b325fb"`);
    await queryRunner.query(`DROP TABLE "wallet_transactions"`);
    await queryRunner.query(`DROP TYPE "public"."wallet_transactions_type_enum"`);
  }
}
