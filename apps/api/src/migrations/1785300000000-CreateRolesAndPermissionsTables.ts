import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesAndPermissionsTables1785300000000
  implements MigrationInterface
{
  name = 'CreateRolesAndPermissionsTables1785300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "role_permissions" (
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role"
        FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission"
        FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."administrateurs_statut_enum" AS ENUM('actif', 'suspendu')`,
    );
    await queryRunner.query(
      `CREATE TABLE "administrateurs" (
        "id" SERIAL NOT NULL,
        "nom" character varying NOT NULL,
        "email" character varying NOT NULL,
        "motdepasse" character varying NOT NULL,
        "statut" "public"."administrateurs_statut_enum" NOT NULL DEFAULT 'actif',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_administrateurs_email" UNIQUE ("email"),
        CONSTRAINT "PK_administrateurs" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "admin_roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "adminId" integer NOT NULL,
        "roleId" uuid NOT NULL,
        "assignedBy" integer,
        "assignedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_admin_roles_adminId_roleId" UNIQUE ("adminId", "roleId"),
        CONSTRAINT "PK_admin_roles" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_roles" ADD CONSTRAINT "FK_admin_roles_admin"
        FOREIGN KEY ("adminId") REFERENCES "administrateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_roles" ADD CONSTRAINT "FK_admin_roles_role"
        FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "admin_roles" DROP CONSTRAINT "FK_admin_roles_role"`);
    await queryRunner.query(`ALTER TABLE "admin_roles" DROP CONSTRAINT "FK_admin_roles_admin"`);
    await queryRunner.query(`DROP TABLE "admin_roles"`);

    await queryRunner.query(`DROP TABLE "administrateurs"`);
    await queryRunner.query(`DROP TYPE "public"."administrateurs_statut_enum"`);

    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission"`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);

    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
