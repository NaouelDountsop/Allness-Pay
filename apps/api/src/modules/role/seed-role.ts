import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

loadEnv({ path: join(__dirname, '../../../../.env') });

const PERMISSIONS = [
  { name: 'roles:manage', description: 'Gérer les administrateurs et les rôles' },
  { name: 'kyc:review', description: 'Revoir les dossiers KYC' },
];

const ROLES = [
  { name: 'admin', description: 'Super administrateur' },
  { name: 'manager', description: 'Super administrateur' },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'afrilinkpay',
    password: process.env.DB_PASSWORD ?? 'afrilinkpay',
    database: process.env.DB_DATABASE ?? 'afrilinkpay',
    entities: [Permission, Role],
  });

  await dataSource.initialize();
  console.log('Connecté à la base de données');

  // 1. Permissions
  const permRepo = dataSource.getRepository(Permission);
  const createdPermissions: Permission[] = [];
  for (const p of PERMISSIONS) {
    let perm = await permRepo.findOne({ where: { name: p.name } });
    if (!perm) {
      perm = await permRepo.save(permRepo.create(p));
      console.log(`Permission "${p.name}" créée`);
    } else {
      console.log(`Permission "${p.name}" existe déjà`);
    }
    createdPermissions.push(perm);
  }

  // 2. Rôles
  const roleRepo = dataSource.getRepository(Role);
  for (const r of ROLES) {
    let role = await roleRepo.findOne({ where: { name: r.name } });
    if (!role) {
      role = await roleRepo.save(
        roleRepo.create({
          ...r,
          permissions: createdPermissions,
        }),
      );
      console.log(` Rôle "${r.name}" créé avec ${createdPermissions.length} permissions`);
    } else {
      // Mettre à jour les permissions du rôle existant
      role.permissions = createdPermissions;
      await roleRepo.save(role);
      console.log(` Rôle "${r.name}" mis à jour avec ${createdPermissions.length} permissions`);
    }
  }

  await dataSource.destroy();
  console.log('Seed terminé');
}

seed().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
