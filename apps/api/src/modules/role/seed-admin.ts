import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { hash } from 'argon2';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { Administrateur, AdministrateurStatut } from './entities/administrateur.entity';
import { AdminRole } from './entities/admin-role.entity';

loadEnv({ path: join(__dirname, '../../../../.env') });

// --- Configuration des admins à créer ---
const ADMINS = [
  {
    nom: 'Super Admin',
    email: 'admin@afrilinkpay.com',
    motdepasse: 'Admin@2026!',
    roleName: 'admin', // rôle à attribuer
  },
];

// --- Permissions ---
const PERMISSIONS = [
  { name: 'roles:manage', description: 'Gérer les administrateurs et les rôles' },
  { name: 'kyc:review', description: 'Revoir les dossiers KYC' },
];

// --- Rôles ---
const ROLES = [
  { name: 'admin', description: 'Super administrateur — tous les droits' },
  { name: 'manager', description: 'Administrateur standard — accès limité' },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'afrilinkpay',
    password: process.env.DB_PASSWORD ?? 'afrilinkpay',
    database: process.env.DB_DATABASE ?? 'afrilinkpay',
    entities: [Permission, Role, Administrateur, AdminRole],
  });

  await dataSource.initialize();
  console.warn('Connecté à la base de données');

  // 1. Créer les permissions
  const permRepo = dataSource.getRepository(Permission);
  const createdPermissions: Permission[] = [];
  for (const p of PERMISSIONS) {
    let perm = await permRepo.findOne({ where: { name: p.name } });
    if (!perm) {
      perm = await permRepo.save(permRepo.create(p));
      console.warn(`Permission "${p.name}" créée`);
    } else {
      console.warn(`Permission "${p.name}" existe déjà`);
    }
    createdPermissions.push(perm);
  }

  // 2. Créer les rôles avec permissions
  const roleRepo = dataSource.getRepository(Role);
  const createdRoles: Map<string, Role> = new Map();
  for (const r of ROLES) {
    let role = await roleRepo.findOne({
      where: { name: r.name },
      relations: ['permissions'],
    });
    if (!role) {
      role = await roleRepo.save(
        roleRepo.create({
          ...r,
          permissions: createdPermissions,
        }),
      );
      console.warn(`Rôle "${r.name}" créé avec ${createdPermissions.length} permissions`);
    } else {
      role.permissions = createdPermissions;
      await roleRepo.save(role);
      console.warn(`Rôle "${r.name}" mis à jour avec ${createdPermissions.length} permissions`);
    }
    createdRoles.set(r.name, role);
  }

  // 3. Créer les administrateurs
  const adminRepo = dataSource.getRepository(Administrateur);
  const adminRoleRepo = dataSource.getRepository(AdminRole);

  for (const a of ADMINS) {
    let admin = await adminRepo.findOne({ where: { email: a.email } });
    if (!admin) {
      admin = await adminRepo.save(
        adminRepo.create({
          nom: a.nom,
          email: a.email,
          motdepasse: await hash(a.motdepasse),
          statut: AdministrateurStatut.ACTIF,
        }),
      );
      console.warn(`Administrateur "${a.nom}" créé (id: ${admin.id})`);
    } else {
      console.warn(`Administrateur "${a.nom}" existe déjà (id: ${admin.id})`);
    }

    // 4. Attribuer le rôle
    const role = createdRoles.get(a.roleName);
    if (role) {
      const existingAssignment = await adminRoleRepo.findOne({
        where: { adminId: admin.id, roleId: role.id },
      });
      if (!existingAssignment) {
        await adminRoleRepo.save(
          adminRoleRepo.create({
            adminId: admin.id,
            roleId: role.id,
          }),
        );
        console.warn(`Rôle "${a.roleName}" attribué à "${a.nom}"`);
      } else {
        console.warn(`Rôle "${a.roleName}" déjà attribué à "${a.nom}"`);
      }
    }
  }

  await dataSource.destroy();
  console.warn('\nSeed terminé avec succès !');
  console.warn('\nComptes créés :');
  for (const a of ADMINS) {
    console.warn(`  - ${a.email} / ${a.motdepasse} (rôle: ${a.roleName})`);
  }
}

seed().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
