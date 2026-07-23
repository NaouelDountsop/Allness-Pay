# Fonctionnalités

Une fonctionnalité = un dossier autonome. Aucune n'est encore créée : ce fichier
décrit la forme que chacune doit prendre.

## Structure attendue

```
features/<fonctionnalite>/
├── api/          Appels HTTP (via `@/lib/api-client`) + clés de requête
├── components/   Composants propres à la fonctionnalité
├── hooks/        Hooks propres à la fonctionnalité (useQuery / useMutation)
├── pages/        Écrans routés
└── types.ts      Types locaux (les types partagés vivent dans @afrilinkpay/shared)
```

## Règles

- Un `feature/` **n'importe jamais** depuis un autre `feature/`. Ce qui devient
  commun remonte dans `components/`, `hooks/` ou `lib/`.
- Les données serveur passent par TanStack Query ; `stores/` ne contient que
  l'état d'interface (session, thème, langue).
- Un composant a une seule responsabilité : soit il récupère des données, soit
  il les affiche.
- Chaque écran gère explicitement ses trois états : chargement, erreur, vide.

## Fonctionnalités prévues

`auth`, `wallet`, `transactions`, `kyc`, `profile`.
