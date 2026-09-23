-- Créer l'administrateur
INSERT INTO "administrateurs" ("nom", "email", "motdepasse", "statut")
VALUES (
  'admin',
  'admin@afrilinkpay.com',
  '$argon2id$v=19$m=65536,t=3,p=4$jZdpiM/wOs8c6k+f2cjPfg$FWg3O7b5fFiTAimwZ2d9B14e1GvrTrlxuHS9PN9Dyo4',
  'actif'
)
ON CONFLICT ("email") DO NOTHING;

-- Attribuer TOUS les rôles existants en BD à cet admin
INSERT INTO "admin_roles" ("adminId", "roleId")
SELECT a."id", r."id"
FROM "administrateurs" a
CROSS JOIN "roles" r
WHERE a."email" = 'admin@afrilinkpay.com'
ON CONFLICT ("adminId", "roleId") DO NOTHING;
