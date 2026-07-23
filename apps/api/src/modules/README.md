# Modules métier

Un domaine = un dossier. Aucun module n'est encore implémenté : ce fichier
décrit la forme que chacun doit prendre.

## Structure attendue

```
modules/<domaine>/
├── <domaine>.module.ts        Câblage des dépendances
├── <domaine>.controller.ts    C — HTTP uniquement : routes, statuts, Swagger
├── <domaine>.service.ts       Règles métier, transactions, orchestration
├── <domaine>.repository.ts    Accès aux données — le seul à connaître TypeORM
├── entities/                  M — modèle persistant
└── dto/                       Contrats d'entrée/sortie + validation
```

Puis on déclare le module dans `src/app.module.ts`.

## Règles de couche

| Couche     | Peut faire                                   | Ne doit jamais faire                          |
| ---------- | -------------------------------------------- | --------------------------------------------- |
| Controller | Valider l'entrée, appeler un service         | Contenir de la règle métier, requêter la BD   |
| Service    | Règles métier, transactions, appels externes | Manipuler `Request`/`Response`, écrire du SQL |
| Repository | Requêtes, projections, pagination            | Contenir de la règle métier                   |
| Entity     | Décrire le schéma et les contraintes         | Contenir de la logique applicative            |

Le contrôleur ne retourne jamais une entité brute, toujours un DTO de réponse
explicite : ajouter une colonne sensible à l'entité ne doit pas suffire à la
publier.

## Domaines prévus

`auth`, `users`, `kyc`, `wallets`, `ledger`, `transactions`, `providers`,
`notifications`, `health`.
