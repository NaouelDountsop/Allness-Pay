import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { WalletsService } from '../../modules/wallet/wallet.service';
import { TransactionsService } from '../../modules/transactions/transactions.service';
import { UsersService } from '../../modules/users/users.service';
import { MailService } from '../../modules/mail/mail.service';
import { ContributionService } from '../../modules/tontine/services/contribution.service';
import { WalletTransactionStatus } from '../../modules/transactions/entities/wallet-transaction.entity';

export interface CreateStripePaymentIntentInput {
  walletNumber: string;
  amount: string;
  currency?: string;
  description?: string;
  tontineId?: string;
}

const MIN_STRIPE_DEPOSIT_AMOUNT = 500;

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly walletsService: WalletsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly contributionService: ContributionService,
  ) {
    const stripeConfig = this.configService.getOrThrow<{
      secretKey: string;
      publishableKey: string;
      webhookSecret: string;
    }>('providers.stripe');
    this.stripe = new Stripe(stripeConfig.secretKey);
    this.webhookSecret = stripeConfig.webhookSecret ?? '';
  }

  async createPaymentIntent(dto: CreateStripePaymentIntentInput, userId: number): Promise<{
    transactionId: string;
    clientSecret: string;
    paymentIntentId: string;
    status: string;
    amount: number;
    currency: string;
  }> {
    const wallet = await this.walletsService.findByWalletNumber(dto.walletNumber);
    this.walletsService.assertOwnership(wallet, userId);
    this.walletsService.assertActive(wallet);

    const amountValue = Number(dto.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      throw new BadRequestException('Le montant doit être un nombre positif');
    }

    const currency = (wallet.currency ?? dto.currency ?? 'XAF').toLowerCase();

    if (currency === 'xaf' && amountValue < MIN_STRIPE_DEPOSIT_AMOUNT) {
      throw new BadRequestException(`Le montant minimum pour un dépôt par carte est de ${MIN_STRIPE_DEPOSIT_AMOUNT} FCFA`);
    }
    // Stripe attend les montants en plus petite unité monétaire.
    // XAF et XOF sont des devises à zéro décimale (pas de centimes).
    const ZERO_DECIMAL_CURRENCIES = new Set(['xaf', 'xof', 'mga', 'bif', 'vnd', 'jpy', 'krw', 'ugx', 'rwf', 'xaf', 'xpf']);
    const amountInStripeUnits = ZERO_DECIMAL_CURRENCIES.has(currency)
      ? Math.round(amountValue)
      : Math.round(amountValue * 100);

    // Récupérer l'email de l'utilisateur si possible pour demander à Stripe d'envoyer un reçu
    let userEmail: string | undefined;
    try {
      const user = await this.usersService.findOne(userId);
      userEmail = (user)?.email;
    } catch {
      // ignore — receipt_email est optionnel
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInStripeUnits,
      currency,
      automatic_payment_methods: { enabled: true },
      description: dto.description ?? `Dépôt wallet ${wallet.walletNumber}`,
      metadata: {
        walletId: wallet.id,
        walletNumber: wallet.walletNumber,
        userId: String(userId),
        currency: wallet.currency ?? 'XAF',
        ...(dto.tontineId ? { tontineId: dto.tontineId } : {}),
      },
      ...(userEmail ? { receipt_email: userEmail } : {}),
    });

    const transaction = await this.transactionsService.recordExternalPayment({
      walletId: wallet.id,
      amount: Number(amountValue),
      operator: null,
      phoneNumber: '',
      description: dto.description ?? 'Dépôt via Stripe',
      provider: 'STRIPE',
      providerRequestId: paymentIntent.id,
      providerTransactionId: paymentIntent.id,
      reference: paymentIntent.id,
    });

    return {
      transactionId: transaction.id,
      clientSecret: paymentIntent.client_secret ?? '',
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  async getPaymentStatus(paymentIntentId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
  }> {
    // Check the local DB first — the webhook updates this immediately.
    // This avoids race conditions where the frontend polls before Stripe's API reflects the change.
    const dbStatus = await this.transactionsService.findExternalPaymentStatus('STRIPE', paymentIntentId);
    if (dbStatus === WalletTransactionStatus.COMPLETED) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        status: 'succeeded',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    }
    if (dbStatus === WalletTransactionStatus.FAILED) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        status: 'canceled',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  async handleWebhook(rawBody: Buffer | string, signature?: string): Promise<{ received: boolean; status: string }> {
    if (!this.webhookSecret) {
      throw new InternalServerErrorException('STRIPE_WEBHOOK_SECRET est manquant');
    }

    if (!signature) {
      throw new UnauthorizedException('Signature Stripe manquante');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook Stripe invalide: ${(error as Error).message}`);
      throw new UnauthorizedException('Signature Stripe invalide');
    }

    const eventType = event.type;

    if (eventType === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = paymentIntent.id;
      const amount = paymentIntent.amount ?? 0;
      const currency = (paymentIntent.currency ?? 'cad').toUpperCase();
      const walletId = paymentIntent.metadata?.walletId ?? '';

      if (!walletId) {
        this.logger.warn(`Webhook Stripe sans walletId pour ${paymentIntentId}`);
        return { received: true, status: 'missing_wallet' };
      }

      const shouldCredit = amount > 0 && (currency === 'CAD' || currency === 'XAF' || currency === 'XOF');
      if (!shouldCredit) {
        this.logger.warn(`Webhook Stripe rejeté pour montant/devise invalides: ${amount} ${currency}`);
        return { received: true, status: 'rejected' };
      }

        const tx = await this.transactionsService.confirmExternalPayment(
          'STRIPE',
          paymentIntentId,
          WalletTransactionStatus.COMPLETED,
          true,
        );

        // Envoyer une notification métier (idempotente) à l'utilisateur.
        try {
          const wallet = await this.walletsService.findById(tx.walletId);
          const user = (wallet ).user ;
          if (user?.email) {
            await this.mailService.sendDepositNotification(user.email, `${user.prenom || ''} ${user.nom || ''}`.trim(), {
              amount: Number(tx.amount),
              currency: wallet.currency || 'XAF',
              reference: tx.id,
              walletNumber: wallet.walletNumber,
              newBalance: wallet.balance,
            });
          }
        } catch (err) {
          // Ne pas bloquer le webhook si l'envoi d'email échoue — on loggue seulement.
          this.logger.warn(`Envoi notification dépôt échoué pour tx=${tx.id}: ${(err as Error).message}`);
        }

        this.logger.log(`Confirmation Stripe OK: paymentIntent=${paymentIntentId}, tx=${tx.id}`);

        // Enregistrer la cotisation tontine si applicable
        const tontineId = paymentIntent.metadata?.tontineId;
        if (tontineId) {
          try {
            const wallet = await this.walletsService.findById(tx.walletId);
            const userId = Number(paymentIntent.metadata?.userId);
            await this.contributionService.recordCardContribution(tontineId, wallet.id, userId, String(amount / 100));
            this.logger.log(`Cotisation tontine enregistrée: tontine=${tontineId}, wallet=${wallet.id}`);
          } catch (err) {
            this.logger.error(`Échec enregistrement cotisation tontine: ${(err as Error).message}`);
          }
        }

        return { received: true, status: 'processed' };
    }

    if (eventType === 'payment_intent.payment_failed' || eventType === 'payment_intent.canceled') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = paymentIntent.id;

      try {
        const tx = await this.transactionsService.confirmExternalPayment(
          'STRIPE',
          paymentIntentId,
          WalletTransactionStatus.FAILED,
          true,
        );
        this.logger.log(
          `Stripe ${eventType}: paymentIntent=${paymentIntentId}, tx=${tx.id} marqué FAILED`,
        );
      } catch (error) {
        this.logger.warn(
          `Stripe ${eventType}: transaction ${paymentIntentId} introuvable ou déjà terminée — ${(error as Error).message}`,
        );
      }

      return { received: true, status: 'processed' };
    }

    this.logger.log(`Webhook Stripe ignoré: ${eventType}`);
    return { received: true, status: 'ignored' };
  }
}
