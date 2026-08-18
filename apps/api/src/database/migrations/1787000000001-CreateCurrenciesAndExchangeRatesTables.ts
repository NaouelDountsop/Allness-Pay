import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCurrenciesAndExchangeRatesTables1787000000001
  implements MigrationInterface
{
  name = 'CreateCurrenciesAndExchangeRatesTables1787000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "currencies" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(3) NOT NULL,
        "name" character varying(100) NOT NULL,
        "symbol" character varying(10) NOT NULL,
        "decimals" integer NOT NULL DEFAULT 2,
        "country" character varying(100),
        "flag" character varying(100),
        "isActive" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_currencies_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_currencies_code" ON "currencies" ("code")`,
    );

    await queryRunner.query(`
      CREATE TABLE "exchange_rates" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "fromCurrencyCode" character varying(3) NOT NULL,
        "toCurrencyCode" character varying(3) NOT NULL,
        "rate" decimal(20,10) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_exchange_rates_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_exchange_rates_pair" ON "exchange_rates" ("fromCurrencyCode", "toCurrencyCode")`,
    );

    await queryRunner.query(`
      ALTER TABLE "exchange_rates"
      ADD CONSTRAINT "FK_exchange_rates_from_currency"
      FOREIGN KEY ("fromCurrencyCode") REFERENCES "currencies"("code") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "exchange_rates"
      ADD CONSTRAINT "FK_exchange_rates_to_currency"
      FOREIGN KEY ("toCurrencyCode") REFERENCES "currencies"("code") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exchange_rates" DROP CONSTRAINT "FK_exchange_rates_to_currency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchange_rates" DROP CONSTRAINT "FK_exchange_rates_from_currency"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_exchange_rates_pair"`);
    await queryRunner.query(`DROP TABLE "exchange_rates"`);
    await queryRunner.query(`DROP INDEX "IDX_currencies_code"`);
    await queryRunner.query(`DROP TABLE "currencies"`);
  }
}
