import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGoogleIdToUser1753920000000 implements MigrationInterface {
  name = 'AddGoogleIdToUser1753920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'utilisateur',
      new TableColumn({
        name: 'googleId',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('utilisateur', 'googleId');
  }
}
