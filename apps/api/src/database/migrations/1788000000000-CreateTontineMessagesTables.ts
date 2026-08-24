import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTontineMessagesTables1788000000000 implements MigrationInterface {
  name = 'CreateTontineMessagesTables1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tontine_messages" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "tontineId" UUID NOT NULL,
        "senderId" INTEGER,
        "content" TEXT,
        "attachmentUrl" VARCHAR(500),
        "attachmentName" VARCHAR(255),
        "isSystem" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tontine_messages_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tontine_message_reads" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "messageId" UUID NOT NULL,
        "userId" INTEGER NOT NULL,
        "readAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tontine_message_reads_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tontine_message_reads_messageId_userId" UNIQUE ("messageId", "userId")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tontine_messages"
      ADD CONSTRAINT "FK_tontine_messages_tontineId"
      FOREIGN KEY ("tontineId") REFERENCES "tontines"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tontine_messages"
      ADD CONSTRAINT "FK_tontine_messages_senderId"
      FOREIGN KEY ("senderId") REFERENCES "utilisateur"("idutilisateur")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tontine_message_reads"
      ADD CONSTRAINT "FK_tontine_message_reads_messageId"
      FOREIGN KEY ("messageId") REFERENCES "tontine_messages"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tontine_message_reads"
      ADD CONSTRAINT "FK_tontine_message_reads_userId"
      FOREIGN KEY ("userId") REFERENCES "utilisateur"("idutilisateur")
      ON DELETE CASCADE
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_tontine_messages_tontineId" ON "tontine_messages" ("tontineId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tontine_messages_senderId" ON "tontine_messages" ("senderId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tontine_messages_createdAt" ON "tontine_messages" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tontine_message_reads_messageId" ON "tontine_message_reads" ("messageId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tontine_message_reads_userId" ON "tontine_message_reads" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tontine_message_reads" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tontine_messages" CASCADE`);
  }
}
