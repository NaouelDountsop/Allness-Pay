# Module Stripe — Guide explicatif (niveau junior)

Ce document explique de manière simple et pédagogique comment fonctionne l'intégration Stripe dans AfriLinkPay. Il s'adresse à un développeur junior qui découvre le code : concepts, responsabilités des fichiers, flux complet et comment tester localement.

## Objectif
Le but du module Stripe est : permettre aux utilisateurs d'effectuer des dépôts par carte, créer les objets Stripe nécessaires (PaymentIntent), suivre le statut du paiement et, une fois confirmé, créditer le portefeuille utilisateur dans la base de données.

## Concepts simples à connaître
- PaymentIntent : c'est l'objet Stripe qui représente une tentative de paiement. Il a un identifiant `pi_...`, un montant (en cents), une devise, et un statut (`requires_payment_method`, `requires_action`, `succeeded`, ...).
- Client secret (`client_secret`) : une valeur secrète renvoyée par Stripe pour que le frontend confirme le paiement côté client.
- Webhook : Stripe envoie des événements (webhooks) à notre serveur quand le statut change (ex: `payment_intent.succeeded`). Pour vérifier que ces requêtes viennent bien de Stripe, on utilise une signature (`STRIPE_WEBHOOK_SECRET`).
- Metadata : petits champs libres envoyés au moment de la création du PaymentIntent (ex: `walletId`, `walletNumber`) pour que le webhook puisse retrouver le compte interne concerné.

## Composants et responsabilités (fichiers principaux)

### `apps/api/src/payments/stripe/stripe.service.ts`

Exemple (simplifié) — création d'un PaymentIntent côté serveur :

```ts
async function createPaymentIntent(dto, userId) {
  const wallet = await walletsService.findByWalletNumber(dto.walletNumber);
  // validation wallet, ownership, active...
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(dto.amount) * 100),
    currency: (dto.currency || wallet.currency || 'CAD').toLowerCase(),
    payment_method_types: ['card'],
    description: dto.description ?? `Dépôt wallet ${wallet.walletNumber}`,
    metadata: { walletId: wallet.id, walletNumber: wallet.walletNumber, userId: String(userId) },
  });

  const transaction = await transactionsService.recordExternalPayment({
    walletId: wallet.id,
    amount: Number(dto.amount),
    provider: 'STRIPE',
    providerTransactionId: paymentIntent.id,
    reference: paymentIntent.id,
  });

  return { transactionId: transaction.id, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
}
```

Rôle : logique métier Stripe côté serveur. Ce service crée le PaymentIntent (avec `metadata`), enregistre une transaction PENDING en base (via `TransactionsService`), lit le statut d'un PaymentIntent, et traite les webhooks pour confirmer la transaction.

### `apps/api/src/payments/stripe/stripe.controller.ts`

Exemple (simplifié) — endpoints exposés :

```ts
@Post('payment-intent')
async createPaymentIntent(@Req() req, @Body() dto) {
  return stripeService.createPaymentIntent(dto, req.user.id);
}

@Get('status/:paymentIntentId')
async getPaymentStatus(@Param('paymentIntentId') id: string) {
  if (!id.startsWith('pi_')) throw new BadRequestException('paymentIntentId invalide');
  return stripeService.getPaymentStatus(id);
}

@Post('webhook')
async webhook(@Req() req) {
  const signature = req.headers['stripe-signature'];
  return stripeService.handleWebhook(req.rawBody, signature);
}
```

Rôle : exposer les endpoints HTTP. Important : `webhook` doit lire `req.rawBody` (non parsé) et la signature Stripe.

### `apps/api/src/main.ts`

Extrait :

```ts
app.use(bodyParser.json({ verify: (req, _res, buf) => { (req as any).rawBody = buf; } }));
```

Remarque : conserver `req.rawBody` avant parsing est nécessaire pour vérifier la signature fournie par Stripe.

### Frontend (Vite/React)

Client API (extrait) — appel pour créer le PaymentIntent :

```ts
// apps/web/src/lib/api/stripe.service.ts
export const stripeService = {
  createPaymentIntent: (data) => apiClient.post('/payments/stripe/payment-intent', data).then(r => r.data),
  getPaymentStatus: (paymentIntentId) => apiClient.get(`/payments/stripe/status/${paymentIntentId}`).then(r => r.data),
};
```

Frontend — confirmation côté client (extrait) :

```tsx
// après avoir reçu clientSecret
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement, billing_details: { name: holderName } },
});
if (error) throw new Error(error.message);
```

Pages pertinentes :
- `apps/web/src/app/user_dashboard/card-deposit-card-info-page.tsx` — formulaire et appel `createPaymentIntent`, puis `confirmCardPayment`.
- `apps/web/src/app/user_dashboard/card-deposit-processing-page.tsx` — fait du polling via `getPaymentStatus` pour afficher le statut.
- `apps/web/src/context/card-deposit-flow-context.tsx` — état partagé du flux (clientSecret, paymentIntentId, transactionId, step, ...).

## Flux pas à pas (ce qu'il se passe réellement)
1. L'utilisateur saisit un montant et clique pour payer.
2. Le frontend appelle `POST /payments/stripe/payment-intent` avec `{ walletNumber, amount, currency?, description? }`.
3. Le backend :
   - vérifie que le wallet appartient à l'utilisateur et qu'il est actif ;
   - crée un PaymentIntent chez Stripe (on envoie `metadata` avec `walletId`, `walletNumber`, `userId`, ...);
   - crée une transaction interne en base (statut PENDING) et stocke `providerTransactionId` = `paymentIntent.id` ;
   - renvoie au frontend `{ transactionId, clientSecret, paymentIntentId, ... }`.
4. Le frontend reçoit `clientSecret` et appelle `stripe.confirmCardPayment(clientSecret, { payment_method: { card, billing_details } })`.
5. Stripe effectue les vérifications nécessaires (3D Secure, Link, etc.) et, si tout est OK, déclenche `payment_intent.succeeded`.
6. Stripe envoie un webhook `payment_intent.succeeded` : notre backend le reçoit, vérifie la signature (`STRIPE_WEBHOOK_SECRET`) et lit `paymentIntent.metadata.walletId` pour savoir quel wallet créditer.
7. Si tout est valide, backend appelle `TransactionsService.confirmExternalPayment(...)` pour marquer la transaction COMPLETED et mettre à jour le solde.

## Exemples de commandes pour tester localement
- Lancer Stripe CLI et récupérer `whsec_...` :
```bash
stripe listen --forward-to http://localhost:3000/api/v1/payments/stripe/webhook
# Copier le secret `whsec_...` dans la variable STRIPE_WEBHOOK_SECRET et redémarrer l'API
```
- Créer un PaymentIntent de test (CAD) et le confirmer immédiatement :
```bash
stripe payment_intents create \
  --amount 1000 \
  --currency cad \
  --payment_method pm_card_visa \
  --confirm true \
  --description "Test dépôt CAD" \
  --metadata walletId=<WALLET_DB_ID>
```

## Erreurs fréquentes et comment les expliquer à un junior
- Erreur `No such payment_intent`: cela signifie que le code a demandé à Stripe un identifiant qui n'existe pas. Très souvent, on a passé par erreur notre `transactionId` (UUID interne) au lieu du `paymentIntentId` (`pi_...`).
  - Correction : vérifier où vous stockez/appelez `paymentIntentId` et assurez-vous d'utiliser la valeur renvoyée par l'API Stripe.
- Signature webhook invalide : Stripe envoie une signature HMAC dans l'en-tête `stripe-signature`. Si `req.rawBody` est modifié (ou si le secret est incorrect), `stripe.webhooks.constructEvent` échoue.
  - Correction : garder `req.rawBody` intact et configurer `STRIPE_WEBHOOK_SECRET` correctement.
- PaymentIntent crée en USD ou sans metadata lors des tests : la commande `stripe trigger` génère des événements génériques qui ne contiennent pas vos `metadata`. Pour tester la logique métier, créez un PaymentIntent explicite avec `--metadata` et la bonne `--currency`.

## Bonnes pratiques à enseigner à un junior
- Toujours tracer (logger) les correspondances entre `transaction.id` (UUID interne) et `paymentIntent.id` (Stripe) — cela facilite énormément le debug.
- Valider côté frontend que `paymentIntentId` commence par `pi_` avant de le passer à un endpoint qui appelle Stripe.
- Ne pas stocker de données sensibles (numéros de carte) sur vos serveurs : laissez Stripe gérer la saisie et la tokenisation.
- Gérer l'idempotence : un webhook peut être envoyé plusieurs fois — votre logique de confirmation doit être idempotente (ne pas créditer deux fois).

## Glossaire rapide
- Wallet : portefeuille interne AfriLinkPay (lié à un utilisateur).
- Transaction : enregistrement interne qui trace un mouvement d'argent (PENDING, COMPLETED, FAILED).
- ProviderTransactionId / providerRequestId : identifiants renvoyés par le prestataire (Stripe) et stockés pour corrélation.

---
Si vous voulez, je peux :
- ajouter des extraits de code commentés (ex : extrait de `createPaymentIntent`),
- créer une checklist de test E2E pour un développeur junior,
- ou ajouter ce guide au README principal et lier depuis `docs/ARCHITECTURE.md`.
