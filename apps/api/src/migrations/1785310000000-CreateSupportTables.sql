CREATE TABLE "support_categories" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" character varying NOT NULL,
  "code" character varying NOT NULL,
  "description" text,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_support_categories_name" UNIQUE ("name"),
  CONSTRAINT "UQ_support_categories_code" UNIQUE ("code"),
  CONSTRAINT "PK_support_categories" PRIMARY KEY ("id")
);

CREATE TABLE "support_articles" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "categoryId" uuid NOT NULL,
  "title" character varying NOT NULL,
  "content" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_articles" PRIMARY KEY ("id")
);
ALTER TABLE "support_articles" ADD CONSTRAINT "FK_support_articles_category"
  FOREIGN KEY ("categoryId") REFERENCES "support_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE TABLE "support_questions" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "articleId" uuid NOT NULL,
  "question" character varying NOT NULL,
  "keywords" text,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_questions" PRIMARY KEY ("id")
);
ALTER TABLE "support_questions" ADD CONSTRAINT "FK_support_questions_article"
  FOREIGN KEY ("articleId") REFERENCES "support_articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
