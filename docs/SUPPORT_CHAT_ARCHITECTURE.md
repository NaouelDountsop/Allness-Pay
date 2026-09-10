# Architecture du support chat AllnessPay

## Objectif

Construire un système de support conversationnel robuste pour AllnessPay sans dépendre immédiatement d’une API IA. Le but est de reproduire le principe des messages guidés de Flo, tout en couvrant l’ensemble des problèmes et questions de la plateforme financière.

Le système doit être :
- fiable,
- testable,
- sécurisé,
- guidé par des scénarios,
- connecté aux données réelles du système,
- capable d’escalader vers un agent humain quand nécessaire.

---

## 1. Principe directeur

Le chat ne doit pas être une simple FAQ écrite en dur.

Il doit être un moteur de conversation piloté par :
- une base de connaissances,
- des intentions,
- des scénarios,
- un contexte utilisateur,
- et des actions métier contrôlées.

Les messages préconstruits servent à guider l’utilisateur.
La base de connaissances sert à couvrir les questions fréquentes.
Les services métier servent à vérifier les données réelles.

---

## 2. Architecture recommandée

```text
                    ┌──────────────────────┐
                    │      UTILISATEUR     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    CHAT ALLNESSPAY   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ MOTEUR DE CONVERSATION│
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼──────────────────┐
             ▼                 ▼                  ▼
       Réponses rapides   Base de connaissances   Contexte
       / choix guidés     / articles FAQ          utilisateur
             │                 │                  │
             └─────────────────┼──────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  ACTION / ESCALADE   │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
          Transaction       Assistance       Agent humain
```

---

## 3. Ne pas construire un énorme if/else

Une mauvaise structure serait :

```ts
if (message.includes('retrait')) {
  // ...
} else if (message.includes('transfert')) {
  // ...
} else if (message.includes('dépôt')) {
  // ...
}
```

Cela devient rapidement impossible à maintenir.

Il faut utiliser des intentions et des scénarios.

### Exemples d’intentions

```text
ACCOUNT
  CREATE_ACCOUNT
  CHANGE_PHONE
  CHANGE_PASSWORD
  CLOSE_ACCOUNT

KYC
  KYC_REQUIRED
  KYC_PENDING
  KYC_FAILED
  KYC_DOCUMENTS

WALLET
  BALANCE
  CREATE_WALLET
  SUSPEND_WALLET
  PRIMARY_WALLET

DEPOSIT
  HOW_TO_DEPOSIT
  DEPOSIT_PENDING
  DEPOSIT_FAILED
  DEPOSIT_NOT_RECEIVED

WITHDRAWAL
  HOW_TO_WITHDRAW
  WITHDRAWAL_PENDING
  WITHDRAWAL_FAILED
  WITHDRAWAL_NOT_RECEIVED

TRANSFER
  HOW_TO_TRANSFER
  TRANSFER_PENDING
  TRANSFER_FAILED
  RECIPIENT_NOT_RECEIVED
  WRONG_AMOUNT

BENEFICIARY
TONTINE
FEES
SECURITY
TECHNICAL
```

---

## 4. Base de connaissances

Le système doit pouvoir couvrir les questions fréquentes via une base de données cohérente.

### Exemple de structure

- Category
- Article
- Question
- Answer
- Keyword

### Exemple

Catégorie : `TRANSFER`

Article : `Comment effectuer un transfert ?`

Questions associées :
- Comment envoyer de l’argent ?
- Comment transférer de l’argent ?
- Comment faire un transfert ?
- Comment envoyer des XAF ?
- Comment envoyer de l’argent à quelqu’un ?

Réponse :
> Pour effectuer un transfert, ouvrez votre portefeuille, sélectionnez le bénéficiaire, indiquez le montant puis confirmez avec votre PIN.

---

## 5. Réponses rapides dynamiques

Les réponses ne doivent pas être seulement du texte. Une réponse peut contenir :
- message,
- quick replies,
- action,
- nextStep.

Exemple :

```json
{
  "message": "Quel problème rencontrez-vous avec votre transfert ?",
  "quickReplies": [
    {
      "label": "Transfert en attente",
      "value": "TRANSFER_PENDING"
    },
    {
      "label": "Destinataire non crédité",
      "value": "RECIPIENT_NOT_RECEIVED"
    },
    {
      "label": "Transfert échoué",
      "value": "TRANSFER_FAILED"
    }
  ]
}
```

Le moteur sait alors que le choix de l’utilisateur déclenche un scénario spécifique.

---

## 6. Contexte utilisateur

Le système doit conserver le contexte de la conversation.

Exemple de contexte :

```ts
interface ConversationContext {
  conversationId: string;
  currentIntent: string;
  currentStep: string;
  selectedTransaction?: string;
  selectedWallet?: string;
  selectedBeneficiary?: string;
  lastQuestion?: string;
  lastAction?: string;
}
```

C’est fondamental pour traiter des messages comme :
> « Pourquoi ça ne marche pas ? »

Sans contexte, cette phrase est presque vide. Avec le contexte précédent, le système comprend que “ça” fait référence à un retrait, un transfert ou un dépôt précis.

---

## 7. Machine à états

Pour les parcours complexes, il faut une machine à états conversationnelle plutôt qu’une suite de conditions.

### Exemple : retrait

```text
WITHDRAWAL_START
       │
       ▼
WITHDRAWAL_METHOD
       │
       ▼
WITHDRAWAL_AMOUNT
       │
       ▼
WITHDRAWAL_VALIDATION
       │
       ▼
WITHDRAWAL_CONFIRMATION
       │
       ├──── confirmé ────► WITHDRAWAL_PROCESSING
       │
       └──── annulé ──────► CANCELLED
                                  │
                                  ▼
                               END
```


a) Avantages
- parcours prévisible,
- plus facile à tester,
- plus facile à maintenir,
- meilleur contrôle de la logique.

---

## 8. Intégration avec les données AllnessPay

L’assistant ne doit pas seulement répondre de façon théorique.

Il doit pouvoir récupérer les vraies données autorisées de l’utilisateur.

Exemple :

> « Où est mon argent ? »

Le moteur identifie :

```text
Intent = TRANSACTION_STATUS
```

Puis il appelle le service métier associé pour lire les transactions pertinentes.

Exemple de logique :

```ts
const transactions = await transactionService.findByUser(userId);
const lastPending = transactions.filter((t) => t.status === 'PENDING');
```

Le système répond ensuite avec une réponse précise et contrôlée.

Important :
- l’agent ne doit pas avoir un accès arbitraire pour modifier un solde,
- il doit passer par les services métier et leurs règles d’autorisation.

---

## 9. Actions métier prédéfinies

Le système doit pouvoir déclencher des actions structurées.

Exemples d’actions :

```text
SHOW_BALANCE
SHOW_TRANSACTIONS
SELECT_TRANSACTION
SHOW_BENEFICIARIES
SHOW_FEES
SHOW_LIMITS
OPEN_KYC
OPEN_DEPOSIT
OPEN_WITHDRAWAL
OPEN_TRANSFER
CREATE_SUPPORT_TICKET
CONTACT_AGENT
```

Ainsi, le bot peut proposer des actions exploitables directement dans l’application :
- voir les dernières transactions,
- ouvrir le KYC,
- afficher les frais,
- ouvrir le dépôt,
- créer un ticket support.

---

## 10. Stratégie de fallback

Même avec une excellente base de connaissances, certaines questions seront inconnues.

Le système doit donc avoir une logique de fallback claire :

```text
Question utilisateur
       │
       ▼
Compréhension
       │
       ├── reconnue ─────► réponse
       │
       └── inconnue
              │
              ▼
         reformulation
              │
              ├── comprise → réponse
              │
              └── inconnue
                       │
                       ▼
                agent humain
```

Par exemple :

> Je ne suis pas certain de bien comprendre votre problème. Pouvez-vous choisir une catégorie ?

Options proposées :
- Transfert
- Dépôt
- Retrait
- Tontine
- Compte
- Autre

---

## 11. Combinaison intelligente : scénarios + IA

Pour AllnessPay, le meilleur modèle est hybride.

### Moteur déterministe
- transfert,
- retrait,
- dépôt,
- KYC,
- sécurité,
- pin,
- transaction,
- tontine.

Ce moteur doit être strict et contrôlé.

### Moteur conversationnel / IA légère
Permet de comprendre des formulations libres :
- “Je veux envoyer de l’argent”
- “Comment faire un transfert ?”
- “Mon argent n’est pas arrivé”

L’IA détecte l’intention, puis le moteur de scénarios reprend le contrôle.

C’est la meilleure manière d’ajouter de la flexibilité sans compromettre la fiabilité financière.

---

## 12. Architecture backend recommandée

Dans le code NestJS, la structure suivante est adaptée :

```text
src/
│
├── support/
│   ├── conversations/
│   ├── messages/
│   ├── agents/
│   ├── tickets/
│   └── support.gateway.ts
│
├── knowledge-base/
│   ├── categories/
│   ├── articles/
│   ├── questions/
│   └── knowledge-base.service.ts
│
├── conversation-engine/
│   ├── conversation-engine.service.ts
│   ├── intent.service.ts
│   ├── state-machine.service.ts
│   ├── quick-reply.service.ts
│   ├── action.service.ts
│   └── context.service.ts
│
└── ai/
    ├── ai.service.ts
    └── ai-tools.service.ts
```

---

## 13. Modèles de données minimaux

### Tableau : support_categories
- id
- name
- code
- createdAt

### Tableau : support_articles
- id
- categoryId
- title
- content
- status

### Tableau : support_questions
- id
- articleId
- question
- keywords

### Tableau : support_conversations
- id
- userId
- status
- scenarioCode
- currentStep
- createdAt
- updatedAt

### Tableau : support_messages
- id
- conversationId
- sender
- content
- metadata

### Tableau : support_quick_replies
- id
- stepId
- label
- value
- nextStepKey

### Tableau : support_tickets
- id
- userId
- category
- scenario
- status
- description
- createdAt

---

## 14. Exemple de parcours utilisateur

### Cas : problème de transfert

L’utilisateur choisit :
- “Problème avec un transfert”

Le chatbot affiche :
- “Quel problème rencontrez-vous ?”
- options :
  - Transfert en attente
  - Destinataire non crédité
  - Transfert échoué
  - Montant incorrect

L’utilisateur choisit :
- “Destinataire non crédité”

Le chatbot affiche :
- “Depuis combien de temps avez-vous efectué le transfert ?”
- options :
  - Moins de 10 minutes
  - 10 minutes à 1 heure
  - Plus d’une heure

L’utilisateur choisit :
- “Plus d’une heure”

Le moteur charge les transactions récentes et affiche :
- “Sélectionnez le transfert concerné”

L’utilisateur sélectionne une transaction réelle.

Le backend vérifie le statut :
- PENDING
- COMPLETED
- FAILED

Puis le bot répond avec une réponse adaptée au vrai statut de la transaction.

C’est ici que le système devient très robuste : les questions sont prédéfinies, mais la réponse finale s’appuie sur le monde réel.

---

## 15. Les règles essentielles pour AllnessPay

1. Ne pas coder les réponses directement dans les contrôleurs.
2. Séparer scenario, contexte, messages et actions.
3. Utiliser des quick replies dynamiques.
4. Garder un contexte conversationnel.
5. Utiliser une machine à états pour les parcours complexes.
6. Connecter le moteur aux services métier avec permissions strictes.
7. Prévoir une escalade vers un agent humain.
8. Journaliser le parcours et les décisions du moteur.
9. Garantir la sécurité des données financières.
10. Ne jamais laisser le chatbot décider arbitrairement une transaction ou un solde.

---

## 16. Recommandation stratégique

Pour AllnessPay, je recommande de démarrer avec :

- scénarios guidés,
- messages préconstruits,
- arbre décisionnel,
- base de connaissances,
- action métier contrôlée,
- escalade support.

Ensuite, seulement si nécessaire, ajouter une IA pour :
- classifier l’intention,
- reformuler,
- comprendre des messages libres,
- ou proposer un chemin de résolution lorsqu’un scénario n’est pas connu.

L’IA ne doit pas être le cœur du système. Le cœur doit rester le moteur de conversation et les services métier.

---

## 17. Conclusion

La bonne architecture pour AllnessPay n’est ni une FAQ brute ni un chatbot totalement libre.

C’est un support conversationnel structuré :

- scénarios,
- décisions,
- actions métier,
- données réelles,
- évaluation du statut,
- réponse adaptée,
- escalade en cas de besoin.

C’est cette architecture qui permettra au produit de grandir sans devenir ingérable.
