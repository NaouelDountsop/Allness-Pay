import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKycTable1785326437049 implements MigrationInterface {
  name = 'CreateKycTable1785326437049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."wallets_status_enum" AS ENUM('active', 'suspended', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "walletNumber" character varying NOT NULL, "userId" integer NOT NULL, "balance" numeric(14,2) NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'XAF', "status" "public"."wallets_status_enum" NOT NULL DEFAULT 'active', "isPrimary" boolean NOT NULL DEFAULT false, "label" character varying, "pinHash" character varying, "pinCreatedAt" TIMESTAMP, "failedPinAttempts" integer NOT NULL DEFAULT '0', "lockedUntil" TIMESTAMP, "version" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4f18b2dd66fee782bd5acbab08f" UNIQUE ("walletNumber"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ecdb33f23e9a6fc392025c0b9" ON "wallets" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "utilisateur"("idutilisateur") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_2ecdb33f23e9a6fc392025c0b9"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TYPE "public"."wallets_status_enum"`);
  }
}
