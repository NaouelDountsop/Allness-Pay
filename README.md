# AfriLinkPay

Plateforme de transfert d'argent avec portefeuille électronique — API NestJS,
front React, base PostgreSQL.

> **État : socle initialisé.** L'infrastructure, la configuration et les
> conventions sont en place. Aucun domaine métier n'est encore implémenté.

## Prérequis

- Node.js 22 (`.nvmrc`)
- Docker Desktop (PostgreSQL + Redis)

## Démarrage

```bash
npm install
```

```bash
cp .env.example .env
```

Renseignez ensuite les secrets JWT dans `.env` — l'API **refuse de démarrer**
avec les valeurs d'exemple :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Puis :

```bash
npm run db:up
```

```bash
npm run build:shared
```

```bash
npm run dev
```

- API : http://localhost:3000/api/v1
- Documentation OpenAPI : http://localhost:3000/api/docs
- Front : http://localhost:5173

## Structure

```
├── apps/
│   ├── api/               NestJS — Controller → Service → Repository
│   │   └── src/
│   │       ├── common/    Filtres, intercepteurs, décorateurs, transformateurs
│   │       ├── config/    Configuration typée + validation d'environnement
│   │       ├── database/  Source de données, module TypeORM, migrations
│   │       └── modules/   Domaines métier (voir son README)
│   └── web/               React + Vite — architecture par fonctionnalités
│       └── src/
│           ├── app/        Providers, routeur
│           ├── features/   Domaines fonctionnels (voir son README)
│           ├── components/ Composants transverses
│           ├── lib/        Client HTTP, client de requêtes
│           └── stores/     État d'interface (Zustand)
├── packages/shared/       Contrats partagés API ↔ front
└── docs/ARCHITECTURE.md   Architecture cible et règles de contribution
```

## Commandes

| Commande                    | Effet                         |
| --------------------------- | ----------------------------- |
| `npm run dev`               | API + front en parallèle      |
| `npm run build`             | Build de tous les espaces     |
| `npm run lint`              | ESLint sur tous les espaces   |
| `npm run typecheck`         | Vérification des types        |
| `npm test`                  | Tests unitaires               |
| `npm run db:up` / `db:down` | PostgreSQL + Redis via Docker |
| `npm run migration:run`     | Applique les migrations       |

## Prochaine étape

Créer le premier module métier en suivant
[`apps/api/src/modules/README.md`](apps/api/src/modules/README.md), et lire au
préalable la section 3 de [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — elle
fixe les règles (montants entiers, grand livre en partie double, idempotence)
qu'il est coûteux de rattraper après coup.
