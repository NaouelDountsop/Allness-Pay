# Module Stripe — AfriLinkPay

Cette documentation décrit l'intégration Stripe utilisée par AfriLinkPay (backend NestJS + frontend Vite/React), les endpoints exposés, la configuration requise, le flux d'exécution, les tests locaux et les principaux pièges à connaître.

## Fichiers clés
- `apps/api/src/payments/stripe/stripe.service.ts` — logique principale : création de PaymentIntent, récupération de statut, traitement du webhook (`handleWebhook`), enregistrement/confirmation des transactions via `TransactionsService`.
- `apps/api/src/payments/stripe/stripe.controller.ts` — endpoints HTTP : création de PaymentIntent, récupération de statut et webhook.
- `apps/api/src/main.ts` — middleware `bodyParser` modifié pour conserver `req.rawBody` nécessaire à la vérification de signature Stripe.
- `apps/web/src/lib/api/stripe.service.ts` — client API frontend pour `createPaymentIntent` et `getPaymentStatus`.
- `apps/web/src/app/user_dashboard/card-deposit-card-info-page.tsx` — création + confirmation côté client.
- `apps/web/src/app/user_dashboard/card-deposit-processing-page.tsx` — polling et affichage du statut.
- `apps/web/src/context/card-deposit-flow-context.tsx` — état partagé du flux de dépôt.

## Endpoints exposés

- POST `/api/v1/payments/stripe/payment-intent` (auth JWT)
  - Payload: `{ walletNumber, amount, currency?, description? }`
  - Action: vérifie le wallet, crée un PaymentIntent Stripe (métadonnées inclues), enregistre une transaction PENDING, retourne `{ transactionId, clientSecret, paymentIntentId, status, amount, currency }`.
- GET `/api/v1/payments/stripe/status/:paymentIntentId` (public)
  - Paramètre attendu: un identifiant Stripe (`pi_...`). Renvoie `{ status, amount, currency }`.
  - Note: le contrôleur valide désormais que `paymentIntentId` commence par `pi_` et renvoie 400 sinon.
- POST `/api/v1/payments/stripe/webhook` (public)
  - Reçoit les événements Stripe; vérifie la signature via `STRIPE_WEBHOOK_SECRET` et `req.rawBody`, traite `payment_intent.succeeded` en confirmant la transaction.

## Variables d'environnement (configuration)
- `providers.stripe.secretKey` — clé secrète Stripe (sk_test_...)
- `providers.stripe.publishableKey` — clé publique (pk_test_...)
- `providers.stripe.webhookSecret` — secret de vérification des webhooks (whsec_...)

Ces variables sont chargées via la configuration NestJS (voir `apps/api/src/config/configuration.ts`). Après modification, redémarrer l'API.

## Flux d'exécution résumé
1. Le frontend demande la création d'un PaymentIntent pour un `walletNumber` et un montant.
2. Le backend vérifie le wallet, crée un PaymentIntent Stripe avec `metadata: { walletId, walletNumber, userId, currency }` et enregistre une transaction PENDING (providerTransactionId = paymentIntent.id).
3. Le frontend reçoit `clientSecret` et `paymentIntentId`, puis appelle `stripe.confirmCardPayment(clientSecret, { payment_method: { card, billing_details } })`.
4. Stripe gère les actions supplémentaires (3DS, Link, etc.).
5. Après succès, Stripe envoie `payment_intent.succeeded` → backend vérifie signature + metadata puis appelle `TransactionsService.confirmExternalPayment(...)` pour marquer la transaction COMPLETED et mettre à jour le solde.

## Points importants et règles métier
- Le webhook doit contenir `paymentIntent.metadata.walletId`. Si absent, le webhook est ignoré (status 'missing_wallet').
- Le module n'accepte que certaines devises (ex. CAD, XAF, XOF) pour créditer automatiquement; sinon l'événement est rejeté.
- Conserver `req.rawBody` avant parsing est requis pour `stripe.webhooks.constructEvent`.
- `createPaymentIntent` stocke le `paymentIntent.id` (ex: `pi_...`) comme `providerTransactionId`; ne pas confondre avec l'UUID interne `transactionId`.

## Tests locaux et commandes utiles

1. Écouter les webhooks et obtenir le secret:
```bash
stripe listen --forward-to http://localhost:3000/api/v1/payments/stripe/webhook
# Notez le whsec_... et mettez-le dans STRIPE_WEBHOOK_SECRET
```

2. Créer un PaymentIntent CAD (avec metadata) pour tester le crédit:
```bash
stripe payment_intents create \
  --amount 1000 \
  --currency cad \
  --payment_method pm_card_visa \
  --confirm true \
  --description "Test dépôt CAD" \
  --metadata walletId=<WALLET_DB_ID>
```

3. Générer un événement simulé (usage limité — les triggers peuvent créer des PIs sans vos metadata):
```bash
stripe trigger payment_intent.succeeded
```

4. Vérifier manuellement le statut côté API:
```bash
curl http://localhost:3000/api/v1/payments/stripe/status/pi_xxx
```

## Débogage — erreurs courantes
- `No such payment_intent`: le client a passé un UUID interne (ex: `bbdb...`) au lieu d'un id Stripe (`pi_...`). Vérifier que le frontend envoie `paymentIntentId` retourné par le backend, et non `transactionId`.
- `Signature Stripe invalide`: `STRIPE_WEBHOOK_SECRET` incorrect ou `req.rawBody` non préservé.
- PaymentIntent en USD ou sans `metadata`: `stripe trigger` crée des événements génériques; pour tester la logique métier (métadonnées + devise) créez un PaymentIntent explicite comme ci‑dessus.

## Recommandations d'amélioration
- Ajouter un log serveur lors de la création du PaymentIntent pour corréler `transaction.id` ↔ `paymentIntent.id`.
- Enregistrer `billing_details.name` aussi dans `metadata` lors de la création si vous souhaitez garder le nom du titulaire indépendamment du comportement de Link.
- Si vous préférez contrôler l'UI Stripe (désactiver la page Link automatique), remplacer `automatic_payment_methods: { enabled: true }` par `payment_method_types: ['card']` lors de la création du PaymentIntent.
- Tests d'intégration automatisés pour `handleWebhook` couvrant les cas: metadata manquante, devise invalide, double webhook (idempotence).

## FAQ rapide
- Q: Link fournit-il toujours le nom du titulaire ?
  - R: Non. Link priorise la méthode et l'authentification; il ne garantit pas tous les `billing_details`. Envoyez `billing_details.name` depuis votre UI ou stockez-le en `metadata` côté serveur.

---
Fichier généré automatiquement par l'assistant.
