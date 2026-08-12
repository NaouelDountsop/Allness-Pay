import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInactiveWalletStatus1786000000000 implements MigrationInterface {
  name = 'AddInactiveWalletStatus1786000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Ajouter la valeur 'inactive' à l'enum PostgreSQL.
    // Les wallets existants conservent leur statut actuel (active/suspended/closed).
    // Seuls les nouveaux wallets seront créés en 'inactive' (voir wallet.service.ts create()).
    await _queryRunner.query(
      `ALTER TYPE "public"."wallets_status_enum" ADD VALUE IF NOT EXISTS 'inactive'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL ne supporte pas REMOVE VALUE sur un enum.
    // La valeur 'inactive' restera dans le type mais ne sera plus utilisée par le code.
  }
}
