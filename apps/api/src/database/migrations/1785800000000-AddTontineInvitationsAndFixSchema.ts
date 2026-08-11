import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTontineInvitationsAndFixSchema1785800000000 implements MigrationInterface {
  name = 'AddTontineInvitationsAndFixSchema1785800000000';

  private async addColumnIfNotExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
    definition: string,
  ) {
    const result = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
      [table, column],
    );
    if (result.length === 0) {
      await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Fix frequency enum: add Bimensuelle ---
    await queryRunner.query(
      `ALTER TABLE "tontines" ALTER COLUMN "frequence" TYPE character varying`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tontine_frequency_enum" CASCADE`);
    await queryRunner.query(
      `CREATE TYPE "public"."tontine_frequency_enum" AS ENUM('Hebdomadaire', 'Bimensuelle', 'Mensuelle')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tontines" ALTER COLUMN "frequence" TYPE "public"."tontine_frequency_enum" USING "frequence"::"public"."tontine_frequency_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tontines" ALTER COLUMN "frequence" SET DEFAULT 'Mensuelle'`,
    );

    // --- Fix status enum: use uppercase ---
    await queryRunner.query(`ALTER TABLE "tontines" ALTER COLUMN "statut" TYPE character varying`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tontine_status_enum" CASCADE`);
    await queryRunner.query(
      `CREATE TYPE "public"."tontine_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'CLOSED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tontines" ALTER COLUMN "statut" TYPE "public"."tontine_status_enum" USING UPPER("statut")::"public"."tontine_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "tontines" ALTER COLUMN "statut" SET DEFAULT 'DRAFT'`);

    // --- Add missing columns to tontine_members (safe if already exist) ---
    await this.addColumnIfNotExists(
      queryRunner,
      'tontine_members',
      'role',
      "character varying NOT NULL DEFAULT 'MEMBER'",
    );
    await this.addColumnIfNotExists(
      queryRunner,
      'tontine_members',
      'status',
      "character varying NOT NULL DEFAULT 'ACTIVE'",
    );
    await this.addColumnIfNotExists(queryRunner, 'tontine_members', 'beneficiaryOrder', 'integer');
    await this.addColumnIfNotExists(
      queryRunner,
      'tontine_members',
      'hasReceivedPayout',
      'boolean NOT NULL DEFAULT false',
    );
    await this.addColumnIfNotExists(
      queryRunner,
      'tontine_members',
      'missedContributions',
      'integer NOT NULL DEFAULT 0',
    );

    // --- Create tontine_invitations table ---
    const invExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'tontine_invitations'`,
    );
    if (invExists.length === 0) {
      await queryRunner.query(`
        CREATE TABLE "tontine_invitations" (
          "id" SERIAL NOT NULL,
          "tontineId" integer NOT NULL,
          "inviterUserId" integer NOT NULL,
          "inviteeUserId" integer,
          "inviteeEmail" character varying(255),
          "token" character varying(100) NOT NULL,
          "status" character varying NOT NULL DEFAULT 'PENDING',
          "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "PK_tontine_invitations_id" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_tontine_invitations_token" UNIQUE ("token")
        )
      `);
      await queryRunner.query(`
        ALTER TABLE "tontine_invitations"
        ADD CONSTRAINT "FK_tontine_invitations_tontineId"
        FOREIGN KEY ("tontineId") REFERENCES "tontines"("id")
        ON DELETE CASCADE
      `);
      await queryRunner.query(
        `CREATE INDEX "IDX_tontine_invitations_tontineId" ON "tontine_invitations" ("tontineId")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_tontine_invitations_inviteeEmail" ON "tontine_invitations" ("inviteeEmail")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_tontine_invitations_token" ON "tontine_invitations" ("token")`,
      );
    }

    // --- Create tontine_cycles table ---
    const cycExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'tontine_cycles'`,
    );
    if (cycExists.length === 0) {
      await queryRunner.query(`
        CREATE TABLE "tontine_cycles" (
          "id" SERIAL NOT NULL,
          "tontineId" integer NOT NULL,
          "cycleNumber" integer NOT NULL,
          "beneficiaryId" integer NOT NULL,
          "status" character varying NOT NULL DEFAULT 'PENDING',
          "totalPot" bigint NOT NULL,
          "collectedAmount" bigint NOT NULL DEFAULT 0,
          "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
          "completedAt" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "PK_tontine_cycles_id" PRIMARY KEY ("id")
        )
      `);
      await queryRunner.query(`
        ALTER TABLE "tontine_cycles"
        ADD CONSTRAINT "FK_tontine_cycles_tontineId"
        FOREIGN KEY ("tontineId") REFERENCES "tontines"("id")
        ON DELETE CASCADE
      `);
      await queryRunner.query(
        `CREATE INDEX "IDX_tontine_cycles_tontineId" ON "tontine_cycles" ("tontineId")`,
      );
    }

    // --- Create tontine_contributions table ---
    const contExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'tontine_contributions'`,
    );
    if (contExists.length === 0) {
      await queryRunner.query(`
        CREATE TABLE "tontine_contributions" (
          "id" SERIAL NOT NULL,
          "cycleId" integer NOT NULL,
          "memberId" integer NOT NULL,
          "amount" bigint NOT NULL,
          "status" character varying NOT NULL DEFAULT 'PENDING',
          "walletTransactionId" integer,
          "paidAt" TIMESTAMP WITH TIME ZONE,
          "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
          "penaltyCount" integer NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "PK_tontine_contributions_id" PRIMARY KEY ("id")
        )
      `);
      await queryRunner.query(`
        ALTER TABLE "tontine_contributions"
        ADD CONSTRAINT "FK_tontine_contributions_cycleId"
        FOREIGN KEY ("cycleId") REFERENCES "tontine_cycles"("id")
        ON DELETE CASCADE
      `);
      await queryRunner.query(
        `CREATE INDEX "IDX_tontine_contributions_cycleId" ON "tontine_contributions" ("cycleId")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tontine_contributions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tontine_cycles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tontine_invitations" CASCADE`);

    await queryRunner.query(
      `ALTER TABLE "tontine_members" DROP COLUMN IF EXISTS "missedContributions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tontine_members" DROP COLUMN IF EXISTS "hasReceivedPayout"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tontine_members" DROP COLUMN IF EXISTS "beneficiaryOrder"`,
    );
    await queryRunner.query(`ALTER TABLE "tontine_members" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "tontine_members" DROP COLUMN IF EXISTS "role"`);

    await queryRunner.query(`ALTER TABLE "tontines" ALTER COLUMN "statut" TYPE character varying`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tontine_status_enum" CASCADE`);
    await queryRunner.query(
      `CREATE TYPE "public"."tontine_status_enum" AS ENUM('active', 'paused', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tontines" ALTER COLUMN "statut" TYPE "public"."tontine_status_enum" USING LOWER("statut")::"public"."tontine_status_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "tontines" ALTER COLUMN "frequence" TYPE character varying`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tontine_frequency_enum" CASCADE`);
    await queryRunner.query(
      `CREATE TYPE "public"."tontine_frequency_enum" AS ENUM('Hebdomadaire', 'Mensuelle')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tontines" ALTER COLUMN "frequence" TYPE "public"."tontine_frequency_enum" USING "frequence"::"public"."tontine_frequency_enum"`,
    );
  }
}
