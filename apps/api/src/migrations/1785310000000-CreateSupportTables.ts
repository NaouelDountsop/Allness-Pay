import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupportTables1785310000000 implements MigrationInterface {
  name = 'CreateSupportTables1785310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "support_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "code" character varying NOT NULL,
        "description" text,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_support_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_support_categories_code" UNIQUE ("code"),
        CONSTRAINT "PK_support_categories" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "support_articles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "categoryId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_articles" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_articles" ADD CONSTRAINT "FK_support_articles_category"
        FOREIGN KEY ("categoryId") REFERENCES "support_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "support_questions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "articleId" uuid NOT NULL,
        "question" character varying NOT NULL,
        "keywords" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_questions" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_questions" ADD CONSTRAINT "FK_support_questions_article"
        FOREIGN KEY ("articleId") REFERENCES "support_articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_questions" DROP CONSTRAINT "FK_support_questions_article"`,
    );
    await queryRunner.query(`DROP TABLE "support_questions"`);

    await queryRunner.query(
      `ALTER TABLE "support_articles" DROP CONSTRAINT "FK_support_articles_category"`,
    );
    await queryRunner.query(`DROP TABLE "support_articles"`);

    await queryRunner.query(`DROP TABLE "support_categories"`);
  }
}
