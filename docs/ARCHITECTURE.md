# Architecture AfriLinkPay

> État : **socle initialisé, aucun domaine métier implémenté.** Ce document
> décrit l'architecture cible et les règles que tout nouveau code doit suivre.

## 1. Vue d'ensemble

Monorepo npm workspaces à trois espaces :

```
afrilinkpay/
├── apps/
│   ├── api/        NestJS + TypeORM + PostgreSQL  (back-end)
│   └── web/        React 19 + TypeScript + Vite   (front-end)
└── packages/
    └── shared/     Contrats, énumérations et utilitaires partagés
```

`packages/shared` est la **source de vérité des contrats**. L'API et le front en
dépendent tous les deux ; aucun type d'échange n'est dupliqué de part et d'autre.

## 2. Back-end — architecture en couches (MVC étendu)

Le guide de bonnes pratiques impose `Controller → Service → Repository`. Chaque
module métier respecte strictement ce découpage — voir
[`apps/api/src/modules/README.md`](../apps/api/src/modules/README.md).

```
modules/<domaine>/
├── <domaine>.module.ts        Câblage des dépendances
├── <domaine>.controller.ts    C — HTTP uniquement : routes, statuts, Swagger
├── <domaine>.service.ts       Règles métier, transactions, orchestration
├── <domaine>.repository.ts    Accès aux données — le seul à connaître TypeORM
├── entities/                  M — modèle persistant
└── dto/                       Contrats d'entrée/sortie + validation
```

Le « V » du MVC est assuré par le front et par la sérialisation des DTO : l'API
ne rend jamais d'entité brute, toujours un DTO de réponse explicite.

### Déjà en place (`src/common`, `src/config`, `src/database`)

- configuration typée et **validée au démarrage** (l'application refuse de
  démarrer avec un secret par défaut ou une variable manquante) ;
- filtre d'exceptions global : aucune trace d'appel ni message SQL ne fuit vers
  le client ;
- intercepteur de corrélation (`X-Request-Id`) et journalisation avec masquage
  des champs sensibles ;
- `BaseEntity` : UUID, `timestamptz`, suppression logique, verrou optimiste ;
- transformateur `BIGINT` ↔ `bigint` (voir §3) ;
- limitation de débit globale.

## 3. Règles à respecter dès le premier module financier

Ces choix découlent du cahier des charges. Les poser après coup coûte une
migration de données.

**Montants.** Entiers en unité mineure (centimes de FCFA), stockés en `BIGINT`,
transportés en `string` dans le JSON. Aucun `float`, aucun `number` JavaScript
pour un montant. Le transformateur est déjà fourni :
`src/common/transformers/bigint.transformer.ts`.

**Grand livre en partie double.** Le solde d'un portefeuille ne doit pas être un
champ modifiable, mais la projection d'écritures immuables (ajout seul). Toute
opération produit au moins deux écritures équilibrées ; un champ `balance_cached`
peut exister pour la lecture, sous contrôle de cohérence périodique.

**Idempotence.** Toute route mutante financière exige un en-tête
`Idempotency-Key`. La clé, l'empreinte de la requête et la réponse sont
persistées **en base** (pas en cache) : la garantie doit survivre au redémarrage
d'un nœud.

**Machine à états.** Une transaction ne change de statut que par des transitions
explicitement autorisées. Une opération sans réponse d'un opérateur reste dans un
état _incertain_ et est rejouée par le rapprochement — jamais présumée réussie.

**Concurrence.** Verrou pessimiste sur le portefeuille avant tout débit, et
ordre de verrouillage stable (par identifiant) pour éviter les interblocages.
Aucun appel réseau à l'intérieur d'une transaction de base de données.

## 4. Front-end — architecture par fonctionnalités

```
src/
├── app/          Composition : providers, routeur, layouts
├── features/     Une fonctionnalité = un dossier autonome (voir son README)
├── components/   Composants transverses (ui/, layout/)
├── lib/          Client HTTP, client de requêtes, utilitaires
├── stores/       État global d'interface (Zustand)
├── hooks/        Hooks transverses
└── styles/       Feuille de style globale et thème
```

**Séparation d'état :** les données serveur vivent dans TanStack Query (cache,
invalidation, chargement, erreur). Zustand ne conserve que l'état d'interface
(session, thème, langue). Ne jamais recopier une réponse d'API dans Zustand.

Un `feature/` n'importe pas depuis un autre `feature/` : ce qui devient commun
remonte dans `components/`, `hooks/` ou `lib/`.

Les mutations ne sont **jamais** rejouées automatiquement (`retry: false`) : sur
une opération financière, un rejeu non maîtrisé produit un doublon.

## 5. Sécurité

- Helmet, CORS par liste blanche explicite, limitation de débit.
- Mots de passe et PIN hachés en Argon2id ; jamais journalisés.
- JWT court + jeton de rafraîchissement rotatif, révocable en base.
- Validation de **toute** entrée en liste blanche (`whitelist`,
  `forbidNonWhitelisted`) ; requêtes toujours paramétrées.
- Aucun secret dans `VITE_*` : ces variables sont lisibles dans le bundle.

## 6. Base de données

- Migrations uniquement ; `synchronize` est désactivé en toute circonstance.
- Clés primaires UUID, horodatages `timestamptz`, suppression logique.
- Index sur toute clé étrangère et toute colonne de filtrage ou de tri.
- Chargement explicite des relations pour éviter le problème N+1.

## 7. Conventions

- Commits : Conventional Commits (`feat:`, `fix:`, `chore:`…).
- Branches : `feature/…`, `fix/…`, `release/…`.
- Fichiers : `kebab-case.role.ts` côté API, `PascalCase.tsx` pour les composants.
