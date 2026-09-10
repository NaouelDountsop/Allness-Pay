# Module Campay — Documentation pour Junior

## 1. Vue d'ensemble

Le module Campay est un **aggregateur de paiement Mobile Money** pour le Cameroun. Il permet deux opérations :
- **Dépôt** : un utilisateur envoie de l'argent depuis son Mobile Money vers son wallet AllnessPay
- **Retrait** : un utilisateur retire de l'argent de son wallet AllnessPay vers son Mobile Money

**Fichiers du module :**

```
apps/api/src/payments/campay/
├── campay.controller.ts      ← Routes HTTP (l'entrée)
├── campay.service.ts          ← Logique métier (le cerveau)
├── dto/
│   ├── campay-payment.dto.ts  ← Validation du corps de requête (dépôt)
│   └── campay-withdraw.dto.ts ← Validation du corps de requête (retrait)
```

---

## 2. Le Controller — `campay.controller.ts`

Le controller est une **couche de routage**. Il ne contient **aucune logique métier** — il reçoit la requête HTTP, valide les paramètres, et délègue au service.

### 2.1 Les routes

| Méthode | Route | Rôle | Auth requise ? |
|---------|-------|------|----------------|
| `GET` | `/payments/campay/test-token` | Tester si le token Campay fonctionne | Oui |
| `POST` | `/payments/campay/test-payment` | Tester un paiement fictif | Non |
| `POST` | `/payments/campay/payment` | **Initier un dépôt Mobile Money** | Oui |
| `POST` | `/payments/campay/withdraw` | **Initier un retrait Mobile Money** | Oui |
| `GET` | `/payments/campay/status/:id` | Consulter le statut d'une transaction | Non |
| `POST` | `/payments/campay/verify/:id` | Vérifier le statut directement chez Campay | Non |
| `POST` | `/payments/campay/callback` | Webhook que Campay appelle quand le statut change | Non |
| `POST` | `/payments/campay/sync` | Synchroniser toutes les transactions PENDING | Non |
| `POST` | `/payments/campay/webhook` | Identique à callback (double endpoint) | Non |

### 2.2 Explication ligne par ligne

#### `@ApiTags('campay')` et `@Controller('payments/campay')`

```typescript
@ApiTags('campay')              // Groupe dans la doc Swagger
@Controller('payments/campay')  // Préfixe de toutes les routes
export class CampayController {
```

Toutes les routes commencent par `/api/v1/payments/campay/...`.

#### `@UseGuards(JwtAuthGuard)`

```typescript
@Post('payment')
@UseGuards(JwtAuthGuard)          // ← Bloque si pas de JWT valide
@ApiBearerAuth('access-token')    // ← Indique dans Swagger qu'il faut un token
async createPayment(@Req() req: AuthenticatedRequest, @Body() dto: CampayPaymentDto) {
  return this.campayService.requestPayment(dto, req.user.id);
}
```

- `JwtAuthGuard` : vérifie que la requête contient un header `Authorization: Bearer <token>` valide
- `@Req() req` : récupère la requête HTTP. On en extrait `req.user.id` (l'ID de l'utilisateur décodé du JWT)
- `@Body() dto` : le corps de la requête JSON est automatiquement validé par le DTO (class-validator)

#### `@Public()` et `@SkipThrottle()`

```typescript
@Post('callback')
@Public()            // ← Pas besoin de JWT (Campay est un tiers, il n'a pas notre token)
@SkipThrottle()      // ← Pas de rate-limiting (Campay envoie beaucoup de webhooks)
async handleCallback(@Body() body: Record<string, unknown>) {
```

- `@Public()` : contourne le `JwtAuthGuard` (défini dans `src/common/decorators`)
- `@SkipThrottle()` : désactive le rate-limiting NestJS pour ce endpoint

#### Le callback

```typescript
const reference = (body?.reference ?? body?.id) as string | undefined;
const status = (body?.status ?? 'UNKNOWN') as string;

if (!reference) {
  return { success: false, message: 'Missing reference' };
}

return await this.campayService.handleCallback(reference, status);
```

Campay envoie un POST avec `{ reference: "xxx", status: "SUCCESSFUL" }`. On extrait les champs et on passe au service.

---

## 3. Le Service — `campay.service.ts`

Le service est le **cerveau** du module. Il contient toute la logique métier et les appels à l'API Campay.

### 3.1 Le constructeur — injection de dépendances

```typescript
constructor(
  private readonly configService: ConfigService,        // Lit les variables d'env
  private readonly dataSource: DataSource,              // Accès brut à la DB (transactions atomiques)
  private readonly transactionsService: TransactionsService,  // CRUD des transactions
  private readonly walletsService: WalletsService,      // CRUD des wallets
  @InjectRepository(WalletTransaction)                  // Repository TypeORM
  private readonly walletTransactionRepo: Repository<WalletTransaction>,
  @InjectRepository(Wallet)
  private readonly walletRepo: Repository<Wallet>,
)
```

Chaque `private readonly xxx` est une **dépendance injectée** par NestJS. Le framework crée une instance de chaque service/repository et la passe au constructeur automatiquement.

### 3.2 `getAccessToken()` — Authentification auprès de Campay

```typescript
async getAccessToken(): Promise<string> {
  // 1. Si on a déjà un token valide, on le réutilise
  if (this.accessToken && Date.now() < this.tokenExpiresAt) {
    return this.accessToken;
  }

  // 2. Sinon, on en demande un nouveau à Campay
  const response = await axios.post(`${this.baseUrl}/api/token/`, {
    username: this.username,
    password: this.password,
  });

  // 3. On stocke le token et sa date d'expiration
  this.accessToken = token;
  this.tokenExpiresAt = Date.now() + (response.data.expires_in ?? 3600) * 1000 - 60_000;
  //                                                                     ↑ conversion secondes→ms   ↑ marge de 60s
  return this.accessToken;
}
```

**Concept** : c'est un **cache en mémoire**. Le token Campay dure ~1h. Au lieu d'en demander un à chaque requête, on le garde en mémoire et on le réutilise jusqu'à 60 secondes avant son expiration.

> **Attention** : si le serveur redémarre, le token est perdu. Ce n'est pas grave — un nouveau sera demandé automatiquement.

### 3.3 `requestPayment()` — Initier un dépôt

C'est la méthode la plus importante. Elle fait 4 choses :

```
Utilisateur → Notre API → Campay API → Réponse Campay → Notre DB
```

#### Étape 1 : Valider le wallet

```typescript
const wallet = await this.walletsService.findByWalletNumber(dto.walletNumber);
this.walletsService.assertOwnership(wallet, userId);  // Le wallet appartient bien à l'utilisateur ?
this.walletsService.assertActive(wallet);              // Le wallet n'est pas suspendu ?
```

#### Étape 2 : Détecter l'opérateur (MTN ou Orange)

```typescript
const operator = detectOperator(dto.phone_number);
if (!operator) {
  throw new BadRequestException('Numéro de téléphone non reconnu...');
}
```

`detectOperator()` (dans `phone-operator.util.ts`) regarde les 3 premiers chiffres du numéro :
- `650-654`, `670-679`, `680-683` → **MTN**
- `640`, `655-659`, `686-699` → **Orange**
- Sinon → `null` (erreur)

#### Étape 3 : Appeler l'API Campay

```typescript
const response = await axios.post(`${this.baseUrl}/api/collect/`, {
  amount: dto.amount,           // "1000" (string)
  currency: 'XAF',              // Toujours XAF pour le Cameroun
  from: phoneFormatted,         // "237680657567" (format Campay)
  description: dto.description,
  external_reference: reference, // "CMP-1725000000000-42" (notre ID interne)
}, {
  headers: { Authorization: `Token ${token}` },
});
```

**Campay renvoie** : `{ reference: "uuid-campay", status: "PENDING", id: "..." }`

#### Étape 4 : Enregistrer dans notre base de données

```typescript
const transaction = await this.transactionsService.recordExternalPayment({
  walletId: wallet.id,
  amount: Number(dto.amount),
  operator,                    // MTN_MOMO ou ORANGE_MONEY
  phoneNumber: dto.phone_number,
  provider: 'CAMPAY',          // Nom du provider
  providerRequestId: campayData.reference,  // UUID Campay
  reference,                   // Notre référence interne "CMP-..."
});
```

**Résultat** : la transaction est créée en statut `PENDING` dans notre DB.

### 3.4 `requestWithdraw()` — Initier un retrait

Même logique que `requestPayment`, mais avec **3 étapes supplémentaires** :

```
1. Appeler Campay AVANT de toucher la DB
2. Si Campay accepte → transaction atomique (DB) :
   a. Lock pessimiste sur le wallet (empêche les concurrent writes)
   b. Vérifier le solde suffisant
   c. Créer la ligne de transaction (status=PENDING)
   d. Débiter le wallet
3. Retourner le résultat
```

**Pourquoi appeler Campay AVANT ?**

Si on débitait le wallet avant et que Campay échouait, on devrait recréditer — c'est compliqué et risqué. En appelant Campay d'abord, on sait si l'opération est possible.

**Lock pessimiste** (ligne 213-217) :

```typescript
const wallet = await manager
  .createQueryBuilder(Wallet, 'wallet')
  .setLock('pessimistic_write')  // ← Empêche un autre thread de lire/écrire ce wallet
  .where('wallet.walletNumber = :walletNumber', { walletNumber: dto.walletNumber })
  .getOne();
```

C'est une sécurité contre les **conditions de course** (race condition) : si deux retraits sont lancés en même temps sur le même wallet, le lock garantit que seul un passe à la fois.

### 3.5 `handleCallback()` — Recevoir le statut de Campay

```typescript
async handleCallback(reference: string, status: string) {
  const campayStatus =
    status === 'SUCCESSFUL'
      ? WalletTransactionStatus.COMPLETED    // Paiement réussi → on crédite le wallet
      : WalletTransactionStatus.FAILED;      // Échoué → on marque comme échoué

  return this.transactionsService.confirmExternalPayment(
    'CAMPAY',           // Provider
    reference,          // UUID Campay (providerRequestId)
    campayStatus,       // COMPLETED ou FAILED
    true,               // isDeposit = true
  );
}
```

**`confirmExternalPayment()`** fait la mise à jour atomique :
1. Trouve la transaction par `providerRequestId`
2. Met à jour son statut
3. Si `COMPLETED` et c'est un dépôt → crédite le wallet

### 3.6 `verifyAndConfirmPayment()` — Vérification en arrière-plan

```typescript
async verifyAndConfirmPayment(transactionId: string) {
  const transaction = await this.walletTransactionRepo.findOne({ where: { id: transactionId } });

  // Si déjà terminé, on ne fait rien
  if (transaction.status === COMPLETED || transaction.status === FAILED) {
    return { status: transaction.status, ... };
  }

  // Sinon, on lance une vérification en arrière-plan (non-bloquante)
  this.verifyInBackground(transaction, identifier).catch(...);

  return { status: transaction.status, ... };  // Retourne immédiatement le statut actuel
}
```

**Concept** : `verifyInBackground` est lancé avec `.catch()` (fire-and-forget). La réponse est renvoyée immédiatement au client, sans attendre la vérification Campay. Le statut sera mis à jour la prochaine fois que le client interroge.

### 3.7 `syncPendingTransactions()` — Synchronisation manuelle

```typescript
async syncPendingTransactions() {
  // 1. Trouver toutes les transactions avec provider='CAMPAY' et status='pending'
  const pendingTransactions = await this.walletTransactionRepo.find({
    where: { provider: 'CAMPAY', status: WalletTransactionStatus.PENDING },
  });

  // 2. Pour chaque transaction, vérifier le statut auprès de Campay
  for (const tx of pendingTransactions) {
    const campayStatus = await this.verifyPaymentStatus(identifier);

    if (campayStatus === 'SUCCESSFUL') → marquer COMPLETED
    if (campayStatus === 'FAILED' || 'REJECTED' || 'CANCELLED') → marquer FAILED
    sinon → toujours PENDING
  }

  return { checked, completed, failed, stillPending };
}
```

**Utilité** : si les callbacks de Campay ont été manqués (serveur down, réseau coupé), cette fonction permet de rattraper les transactions bloquées en `PENDING`.

---

## 4. Les DTOs — Validation des entrées

### `CampayPaymentDto` (dépôt)

```typescript
walletNumber: string;    // Format: WLT + 10 chiffres (ex: WLT1234567890)
amount: string;          // Nombre positif, max 2 décimales (ex: "1000")
phone_number: string;    // 9 chiffres ou avec indicatif 237 (ex: "680657567" ou "237680657567")
description?: string;    // Optionnel, max 255 caractères
```

Les regex de validation :

```typescript
WALLET_NUMBER_REGEX = /^WLT\d{10}$/     // WLT + exactement 10 chiffres
AMOUNT_REGEX = /^(?!0*(\.0+)?$)\d+(\.\d{1,2})?$/>  // Pas de "0" ou "0.00", max 2 décimales
PHONE_REGEX = /^(\d{9}|237\d{9}|\+237\d{9})$/       // 9 chiffres, ou 12 avec 237, ou avec +
```

---

## 5. Le flux complet d'un dépôt

```
┌─────────────┐    POST /payment     ┌──────────────┐    POST /api/collect/    ┌──────────┐
│  Frontend    │ ──────────────────→ │  Controller   │ ──────────────────────→ │  Campay   │
│  (React)     │                     │  (route)      │                         │  API      │
└─────────────┘                     └──────────────┘                         └──────────┘
                                            │                                       │
                                            │  requestPayment()                     │
                                            ▼                                       ▼
                                     ┌──────────────┐                         ┌──────────┐
                                     │   Service     │ ←─ token ───────────── │  Token   │
                                     │  (logique)    │                         │  endpoint│
                                     └──────────────┘                         └──────────┘
                                            │
                                            │ recordExternalPayment()
                                            ▼
                                     ┌──────────────┐
                                     │  PostgreSQL   │
                                     │  (transaction │
                                     │   PENDING)    │
                                     └──────────────┘

... plus tard (callback Campay) ...

┌──────────┐    POST /callback    ┌──────────────┐    confirmExternalPayment()    ┌──────────────┐
│  Campay   │ ──────────────────→ │  Controller   │ ───────────────────────────→ │  Service      │
│  API      │                     │  (callback)   │                              │  → DB: PENDING│
└──────────┘                     └──────────────┘                              │    → COMPLETED│
                                                                               └──────────────┘
```

---

## 6. Les statuts possibles

| Statut DB | Signification |
|-----------|---------------|
| `PENDING` | Transaction initiée, en attente de confirmation côté Mobile Money |
| `COMPLETED` | Paiement confirmé, wallet crédité |
| `FAILED` | Paiement échoué ou rejeté |
| `CANCELLED` | Transaction annulée |

**Mapping Campay → DB :**

| Campay renvoie | Statut DB |
|----------------|-----------|
| `SUCCESSFUL` | `COMPLETED` |
| `FAILED` | `FAILED` |
| `REJECTED` | `FAILED` |
| `CANCELLED` | `FAILED` |
| `PENDING` | inchangé (reste `PENDING`) |

---

## 7. Les utilitaires — `phone-operator.util.ts`

### `detectOperator(phoneNumber)`

Détecte l'opérateur à partir du préfixe national (3 premiers chiffres).

```typescript
// Formats acceptés :
//   6XXYYYZZ       → préfixe = 6XX
//   2376XXYYYZZ    → préfixe = 6XX
//   +2376XXYYYZZ   → préfixe = 6XX

const MTN_PREFIXES = ['650', '651', '652', '653', '654', '670'-'679', '680'-'683'];
const ORANGE_PREFIXES = ['640', '655'-'659', '686'-'689', '690'-'699'];
```

Retourne `LinkedAccountOperator.MTN_MOMO`, `ORANGE_MONEY`, ou `null`.

### `normalizePhoneForCampay(phoneNumber)`

Convertit n'importe quel format en `237XXXXXXXXX` (12 chiffres, sans `+`).

```typescript
// "680657567"    → "237680657567"
// "237680657567" → "237680657567"
// "+237680657567"→ "237680657567"
```

---

## 8. Les erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `ER201: Minimum amount for Orange is 10.00` | Montant trop bas (< 10 FCFA) | Minimum 10 FCFA |
| `Numéro de téléphone non reconnu` | Préfixe inconnu (pas MTN ni Orange) | Vérifier le numéro |
| `Token Campay vide` | Campay n'a pas retourné de token | Vérifier credentials dans `.env` |
| `Solde insuffisant` (retrait) | Wallet n'a pas assez d'argent | Vérifier le solde |
| `Ce wallet n'est pas actif` | Wallet suspendu ou fermé | Réactiver le wallet |

---

## 9. Variables d'environnement requises

Définies dans `src/config/configuration.ts` :

```env
CAMPAY_BASE_URL=https://demo.campay.net     # URL de l'API Campay
CAMPAY_USERNAME=xxx                           # Identifiant Campay
CAMPAY_PASSWORD=xxx                           # Mot de passe Campay
CAMPAY_WEBHOOK_KEY=xxx                        # Clé de vérification des webhooks
```

---

## 10. Points d'attention

1. **Le token est en mémoire** : si 2 workers (clustering) tournent, chacun a son propre token. Ce n'est pas grave — Campay accepte plusieurs tokens simultanés.

2. **Pas de timeout côté backend** : si Campay ne répond pas au callback, la transaction reste `PENDING`. Utiliser `POST /sync` pour rattraper.

3. **Le retrait débite AVANT la confirmation** : le wallet est débité immédiatement, même si Campay met du temps à confirmer. Si Campay échoue, il faut un mécanisme de recrédit (pas encore implémenté).

4. **Les montants sont en string** : Campay attend `"1000"` (string), pas `1000` (number). C'est pourquoi le DTO validate avec une regex et le service convertit avec `parseInt()`.

5. **Le callback est public** : peut appeler `/callback` avec une fausse référence. La sécurité repose sur le fait que `confirmExternalPayment()` vérifie que la référence existe bien dans notre DB.
