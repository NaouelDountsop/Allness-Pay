import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { WalletTransactionStatus } from '../../modules/transactions/entities/wallet-transaction.entity';

const mockStripeClient = {
  paymentIntents: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripeClient);
});

describe('StripeService', () => {
  let service: StripeService;
  let configService: { getOrThrow: jest.Mock };
  let walletsService: {
    findByWalletNumber: jest.Mock;
    assertOwnership: jest.Mock;
    assertActive: jest.Mock;
  };
  let transactionsService: {
    recordExternalPayment: jest.Mock;
    confirmExternalPayment: jest.Mock;
  };
  let usersService: { findOne: jest.Mock };
  let mailService: { sendDepositNotification: jest.Mock };

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue({
        secretKey: 'sk_test_123',
        publishableKey: 'pk_test_123',
        webhookSecret: 'whsec_123',
      }),
    };

    walletsService = {
      findByWalletNumber: jest.fn(),
      assertOwnership: jest.fn(),
      assertActive: jest.fn(),
    };

    transactionsService = {
      recordExternalPayment: jest.fn(),
      confirmExternalPayment: jest.fn(),
    };

    usersService = {
      findOne: jest.fn().mockResolvedValue({ id: 42, email: 'user@example.com', prenom: 'John', nom: 'Doe' }),
    };

    mailService = {
      sendDepositNotification: jest.fn().mockResolvedValue(undefined),
    };

    service = new StripeService(
      configService as unknown as ConfigService,
      walletsService as any,
      transactionsService as any,
      usersService as any,
      mailService as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a PaymentIntent for a wallet deposit', async () => {
    walletsService.findByWalletNumber.mockResolvedValue({
      id: 'wallet-1',
      userId: 42,
      walletNumber: 'WLT-123',
      status: 'active',
      currency: 'CAD',
    });
    transactionsService.recordExternalPayment.mockResolvedValue({ id: 'tx-1' });
    mockStripeClient.paymentIntents.create.mockResolvedValue({
      id: 'pi_123',
      client_secret: 'cs_123',
      status: 'requires_payment_method',
      amount: 1000,
      currency: 'cad',
    });

    const result = await service.createPaymentIntent(
      {
        walletNumber: 'WLT-123',
        amount: '10',
        currency: 'CAD',
        description: 'Dépôt de test',
      },
      42,
    );

    expect(result.clientSecret).toBe('cs_123');
    expect(result.transactionId).toBe('tx-1');
    expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1000,
        currency: 'cad',
        metadata: expect.objectContaining({ walletId: 'wallet-1', userId: '42' }),
      }),
    );
  });

  it('validates amount before creating a PaymentIntent', async () => {
    walletsService.findByWalletNumber.mockResolvedValue({
      id: 'wallet-1',
      userId: 42,
      walletNumber: 'WLT-123',
      status: 'active',
      currency: 'CAD',
    });

    await expect(
      service.createPaymentIntent(
        {
          walletNumber: 'WLT-123',
          amount: '0',
          currency: 'CAD',
        },
        42,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('confirms a succeeded payment intent webhook', async () => {
    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 1000,
          currency: 'cad',
          metadata: { walletId: 'wallet-1' },
        },
      },
    });

    transactionsService.confirmExternalPayment.mockResolvedValue({
      id: 'tx-1',
      status: WalletTransactionStatus.COMPLETED,
    });

    const result = await service.handleWebhook(Buffer.from('test-body'), 'sig_123');

    expect(result.received).toBe(true);
    expect(transactionsService.confirmExternalPayment).toHaveBeenCalledWith(
      'STRIPE',
      'pi_123',
      WalletTransactionStatus.COMPLETED,
      true,
    );
  });
});
