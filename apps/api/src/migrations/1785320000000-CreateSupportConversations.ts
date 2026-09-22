import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupportConversations1785320000000 implements MigrationInterface {
  name = 'CreateSupportConversations1785320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "support_conversations" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "agentId" integer,
        "status" character varying NOT NULL DEFAULT 'open',
        "subject" character varying(200),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_conversations" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "support_messages" (
        "id" SERIAL NOT NULL,
        "conversationId" integer NOT NULL,
        "senderId" integer NOT NULL,
        "senderType" character varying NOT NULL DEFAULT 'user',
        "content" text NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_messages" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "support_messages" ADD CONSTRAINT "FK_support_messages_conversation"
        FOREIGN KEY ("conversationId") REFERENCES "support_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_messages" DROP CONSTRAINT "FK_support_messages_conversation"`,
    );
    await queryRunner.query(`DROP TABLE "support_messages"`);
    await queryRunner.query(`DROP TABLE "support_conversations"`);
  }
}
