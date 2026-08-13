import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TransactionsService } from '../../modules/transactions/transactions.service';
import { WalletTransactionStatus } from '../../modules/transactions/entities/wallet-transaction.entity';
import { WalletsService } from '../../modules/wallet/wallet.service';
import { Wallet } from '../../modules/wallet/entities/wallet.entity';
import { detectOperator } from '../../common/utils/phone-operator.util';
import { TranzakPaymentDto } from './dto/tranzak-payment.dto';
import { ProvidersConfig } from '../../config/configuration';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from '../../modules/transactions/entities/wallet-transaction.entity';

@Injectable()
export class TranzakService {
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly appKey: string;
  private readonly callbackUrl: string;
  private readonly returnUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionsService: TransactionsService,
    private readonly walletsService: WalletsService,
    
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepo: Repository<WalletTransaction>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
  ) {
    const tranzakConfig =
      this.configService.getOrThrow<ProvidersConfig['tranzak']>('providers.tranzak');
    this.baseUrl = tranzakConfig.baseUrl;
    this.appId = tranzakConfig.appId;
    this.appKey = tranzakConfig.appKey;
    this.callbackUrl = tranzakConfig.callbackUrl;
    this.returnUrl = tranzakConfig.returnUrl;
    console.warn('Tranzak config loaded:', { baseUrl: this.baseUrl, appId: this.appId, appKey: this.appKey.substring(0, 10) + '...' });
  }

  async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/token`, {
        appId: this.appId,
        appKey: this.appKey,
      });

      const token = response.data.data.token;
      console.warn('Tranzak auth response:', JSON.stringify(response.data).substring(0, 200));
      return token;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      throw new InternalServerErrorException(
        `Impossible de récupérer le token Tranzak: ${axiosError.response?.data || axiosError.message}`,
      );
    }
  }

  /**
   * Crée un paiement via redirection web (page hébergée Tranzak).
   * Conservé pour les tests / fallback.
   */
  async createPayment(data: {
    amount: number;
    currencyCode: string;
    description: string;
    mchTransactionRef: string;
    returnUrl: string;
    callbackUrl?: string;
  }) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(`${this.baseUrl}/xp021/v1/request/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-App-ID': this.appId,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      throw new InternalServerErrorException(
        `Impossible de créer le paiement Tranzak: ${axiosError.response?.data || axiosError.message}`,
      );
    }
  }

  /**
   * Crée une charge directe mobile money (MTN Momo / Orange Money Cameroun).
   * La demande est poussée directement sur le téléphone de l'utilisateur (USSD),
   * sans redirection vers la page web Tranzak — sauf si status = PAYER_REDIRECT_REQUIRED.
   */
  async createDirectMobileWalletCharge(data: {
    amount: number;
    currencyCode: string;
    description: string;
    mchTransactionRef: string;
    mobileWalletNumber: string;
    returnUrl: string;
    callbackUrl?: string;
  }) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/xp021/v1/request/create-mobile-wallet-charge`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-App-ID': this.appId,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      throw new InternalServerErrorException(
        `Impossible de créer la charge mobile wallet Tranzak: ${JSON.stringify(axiosError.response?.data) || axiosError.message}`,
      );
    }
  }

  /**
   * Initie un dépôt via charge directe mobile money.
   * Ne redirige plus vers la page hébergée Tranzak dans le cas normal.
   * Retourne un statut PENDING que le frontend pourra poller via /payments/tranzak/status/:transactionId.
   * Fallback : si Tranzak exige une action de sécurité (PAYER_REDIRECT_REQUIRED),
   * on retourne quand même le paymentAuthUrl pour ne pas bloquer l'utilisateur.
   */
  async initiatePayment(
    dto: TranzakPaymentDto,
    userId: number,
  ): Promise<{
    transactionId: string;
    status: string;
    paymentUrl?: string;
  }> {
    const wallet = await this.walletsService.findByWalletNumber(dto.walletNumber);
    this.walletsService.assertOwnership(wallet, userId);
    this.walletsService.assertActive(wallet);

    const operator = detectOperator(dto.phone_number);
    if (!operator) {
      throw new BadRequestException(
        'Numéro de téléphone non reconnu. Seuls les préfixes MTN (650-659) et Orange (690-699) sont acceptés.',
      );
    }

    const amount = parseInt(dto.amount, 10);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Le montant doit être un nombre positif');
    }

    const mchTransactionRef = `TRZ-${Date.now()}-${userId}`;

    // Le numéro doit être préfixé du code pays sans le "+" (ex: 237680657567)
    const mobileWalletNumber = dto.phone_number.replace(/^\+/, '');

    const tranzakResponse = await this.createDirectMobileWalletCharge({
      amount,
      currencyCode: 'XAF',
      description: dto.description ?? 'Dépôt AfriLinkPay',
      mchTransactionRef,
      mobileWalletNumber,
      returnUrl: this.returnUrl,
      callbackUrl: this.callbackUrl || undefined,
    });

    // Log temporaire pour diagnostiquer les réponses Tranzak inattendues
    console.log('Réponse Tranzak brute:', JSON.stringify(tranzakResponse, null, 2));

    if (!tranzakResponse.success) {
      throw new InternalServerErrorException(
        `Tranzak a refusé la charge directe: ${tranzakResponse.errorMsg ?? 'raison inconnue'} (code ${tranzakResponse.errorCode ?? '?'})`,
      );
    }

    const tranzakData = tranzakResponse.data;
    const requestId = tranzakData?.requestId;
    const status = tranzakData?.status;
    const paymentAuthUrl = tranzakData?.links?.paymentAuthUrl;

    if (!requestId) {
      throw new InternalServerErrorException(
        `Réponse Tranzak invalide : requestId manquant. Réponse complète: ${JSON.stringify(tranzakData)}`,
      );
    }

    // Enregistrement dans le ledger interne, statut PENDING par défaut
    const transaction = await this.transactionsService.recordExternalPayment({
      walletId: wallet.id,
      amount: BigInt(dto.amount),
      operator,
      phoneNumber: dto.phone_number,
      description: dto.description ?? 'Dépôt via Tranzak',
      provider: 'TRANZAK',
      providerRequestId: requestId,
      providerTransactionId: tranzakData?.transactionId ?? null,
      reference: mchTransactionRef,
    });

    // Cas rare : Tranzak exige une redirection pour raison de sécurité (OTP, CAPTCHA...)
    if (status === 'PAYER_REDIRECT_REQUIRED' && paymentAuthUrl) {
      return {
        transactionId: transaction.id,
        status: 'PAYER_REDIRECT_REQUIRED',
        paymentUrl: paymentAuthUrl,
      };
    }

    // Cas normal : le push a été envoyé directement au téléphone
    return {
      transactionId: transaction.id,
      status: 'PENDING',
    };
  }

  async handleCallback(identifier: string, _status: string, isRequestId: boolean) {
    // Vérifier directement auprès de Tranzak le statut réel du paiement
    const verifiedStatus = await this.verifyPaymentStatus(identifier);

    const tranzakStatus =
      verifiedStatus === 'SUCCESSFUL'
        ? WalletTransactionStatus.COMPLETED
        : WalletTransactionStatus.FAILED;

    return this.transactionsService.confirmExternalPayment(
      'TRANZAK',
      identifier,
      tranzakStatus,
      isRequestId,
    );
  }

  /**
   * Retourne le statut courant d'une transaction pour le polling frontend.
   * Vérifie que la transaction appartient bien au wallet de l'utilisateur connecté.
   * Lit uniquement la DB locale (pas d'appel Tranzak) pour rester rapide.
   */
  async getPaymentStatus(
    transactionId: string,
    userId: number,
  ): Promise<{
    status: WalletTransactionStatus;
    amount: string;
  }> {
    const transaction = await this.walletTransactionRepo.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException(`Transaction ${transactionId} introuvable`);
    }

    const wallet = await this.walletRepo.findOneOrFail({
      where: { id: transaction.walletId },
    });
    this.walletsService.assertOwnership(wallet, userId);

    return {
      status: transaction.status,
      amount: transaction.amount.toString(),
    };
  }

  /**
   * Version publique du polling — sans vérification d'identité.
   * Utilisée par le frontend après initiation du paiement.
   * Le transactionId est un UUID invérifiable, pas besoin de JWT.
   */
  async getPaymentStatusByTransactionId(
    transactionId: string,
  ): Promise<{
    status: WalletTransactionStatus;
    amount: string;
  }> {
    const transaction = await this.walletTransactionRepo.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException(`Transaction ${transactionId} introuvable`);
    }

    return {
      status: transaction.status,
      amount: transaction.amount.toString(),
    };
  }

  /**
   * Vérifie le statut réel d'un paiement auprès de Tranzak.
   * Le callback envoie providerTransactionId (TX...), mais l'API verify
   * utilise providerRequestId (REQ...). On cherche d'abord en DB.
   */
  private async verifyPaymentStatus(providerTransactionId: string): Promise<string> {
    const transaction = await this.walletTransactionRepo.findOne({
      where: { provider: 'TRANZAK', providerTransactionId },
    });

    const requestIdToVerify = transaction?.providerRequestId ?? providerTransactionId;

    try {
      const token = await this.getAccessToken();

      const response = await axios.get(`${this.baseUrl}/xp021/v1/request/details`, {
        params: { requestId: requestIdToVerify },
        headers: {
          Authorization: `Bearer ${token}`,
          'X-App-ID': this.appId,
        },
      });

      return response.data?.data?.status ?? 'FAILED';
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      throw new InternalServerErrorException(
        `Impossible de vérifier le paiement Tranzak ${requestIdToVerify} (HTTP ${axiosError.response?.status ?? 'unknown'}): ${JSON.stringify(axiosError.response?.data ?? axiosError.message)}`,
      );
    
    }
  }

  
}

// import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
// import { TransactionsService } from '../../modules/transactions/transactions.service';
// import { WalletTransactionStatus } from '../../modules/transactions/entities/wallet-transaction.entity';
// import { WalletsService } from '../../modules/wallet/wallet.service';
// import { detectOperator } from '../../common/utils/phone-operator.util';
// import { TranzakPaymentDto } from './dto/tranzak-payment.dto';
// import { ProvidersConfig } from '../../config/configuration';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { WalletTransaction } from '../../modules/transactions/entities/wallet-transaction.entity';

// @Injectable()
// export class TranzakService {
//   private readonly baseUrl: string;
//   private readonly appId: string;
//   private readonly appKey: string;
//   private readonly callbackUrl: string;

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly transactionsService: TransactionsService,
//     private readonly walletsService: WalletsService,
//     @InjectRepository(WalletTransaction)
//     private readonly walletTransactionRepo: Repository<WalletTransaction>,
//   ) {
//     const tranzakConfig =
//       this.configService.getOrThrow<ProvidersConfig['tranzak']>('providers.tranzak');
//     this.baseUrl = tranzakConfig.baseUrl;
//     this.appId = tranzakConfig.appId;
//     this.appKey = tranzakConfig.appKey;
//     this.callbackUrl = tranzakConfig.callbackUrl;
//   }

//   async getAccessToken(): Promise<string> {
//     try {
//       const response = await axios.post(`${this.baseUrl}/auth/token`, {
//         appId: this.appId,
//         appKey: this.appKey,
//       });

//       return response.data.data.token;
//     } catch (error: unknown) {
//       const axiosError = error as { response?: { data?: unknown }; message?: string };
//       throw new InternalServerErrorException(
//         `Impossible de récupérer le token Tranzak: ${axiosError.response?.data || axiosError.message}`,
//       );
//     }
//   }

//   async createPayment(data: {
//     amount: number;
//     currencyCode: string;
//     description: string;
//     mchTransactionRef: string;
//     returnUrl: string;
//     callbackUrl?: string;
//   }) {
//     try {
//       const token = await this.getAccessToken();

//       const response = await axios.post(`${this.baseUrl}/xp021/v1/request/create`, data, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'X-App-ID': this.appId,
//           'Content-Type': 'application/json',
//         },
//       });

//       return response.data;
//     } catch (error: unknown) {
//       const axiosError = error as { response?: { data?: unknown }; message?: string };
//       throw new InternalServerErrorException(
//         `Impossible de créer le paiement Tranzak: ${axiosError.response?.data || axiosError.message}`,
//       );
//     }
//   }

//   async initiatePayment(
//     dto: TranzakPaymentDto,
//     userId: number,
//   ): Promise<{ paymentUrl: string; transactionId: string }> {
//     const wallet = await this.walletsService.findByWalletNumber(dto.walletNumber);
//     this.walletsService.assertOwnership(wallet, userId);
//     this.walletsService.assertActive(wallet);

//     const operator = detectOperator(dto.phone_number);
//     if (!operator) {
//       throw new BadRequestException(
//         'Numéro de téléphone non reconnu. Seuls les préfixes MTN (650-659) et Orange (690-699) sont acceptés.',
//       );
//     }

//     const amount = parseInt(dto.amount, 10);
//     if (isNaN(amount) || amount <= 0) {
//       throw new BadRequestException('Le montant doit être un nombre positif');
//     }

//     const mchTransactionRef = `TRZ-${Date.now()}-${userId}`;

//     const tranzakResponse = await this.createPayment({
//       amount,
//       currencyCode: 'XAF',
//       description: dto.description ?? 'Dépôt AfriLinkPay',
//       mchTransactionRef,
//       returnUrl: 'http://localhost:5173/payment/return',
//       callbackUrl: this.callbackUrl || undefined,
//     });

//     const tranzakData = tranzakResponse.data;
//     const requestId = tranzakData?.requestId;
//     const paymentUrl = tranzakData?.links?.paymentAuthUrl;

//     if (!requestId || !paymentUrl) {
//       throw new InternalServerErrorException(
//         'Réponse Tranzak invalide : requestId ou paymentAuthUrl manquant',
//       );
//     }

//     const transaction = await this.transactionsService.recordExternalPayment({
//       walletId: wallet.id,
//       amount: BigInt(dto.amount),
//       operator,
//       phoneNumber: dto.phone_number,
//       description: dto.description ?? 'Dépôt via Tranzak',
//       provider: 'TRANZAK',
//       providerRequestId: requestId,
//       providerTransactionId: tranzakData?.transactionId ?? null,
//       reference: mchTransactionRef,
//     });

//     return {
//       paymentUrl,
//       transactionId: transaction.id,
//     };
//   }

//   async handleCallback(identifier: string, _status: string, isRequestId: boolean) {
//     // Vérifier directement auprès de Tranzak le statut réel du paiement
//     const verifiedStatus = await this.verifyPaymentStatus(identifier);

//     const tranzakStatus =
//       verifiedStatus === 'SUCCESSFUL'
//         ? WalletTransactionStatus.COMPLETED
//         : WalletTransactionStatus.FAILED;

//     return this.transactionsService.confirmExternalPayment(
//       'TRANZAK',
//       identifier,
//       tranzakStatus,
//       isRequestId,
//     );
//   }

//   /**
//    * Vérifie le statut réel d'un paiement auprès de Tranzak.
//    * Le callback envoie providerTransactionId (TX...), mais l'API verify
//    * utilise providerRequestId (REQ...). On cherche d'abord en DB.
//    */
//   private async verifyPaymentStatus(providerTransactionId: string): Promise<string> {
//     // Chercher le providerRequestId en DB
//     const transaction = await this.walletTransactionRepo.findOne({
//       where: { provider: 'TRANZAK', providerTransactionId },
//     });

//     const requestIdToVerify = transaction?.providerRequestId ?? providerTransactionId;

//     try {
//       const token = await this.getAccessToken();

//       const response = await axios.get(`${this.baseUrl}/xp021/v1/request/details`, {
//         params: { requestId: requestIdToVerify },
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'X-App-ID': this.appId,
//         },
//       });

//       return response.data?.data?.status ?? 'FAILED';
//     } catch (error: unknown) {
//       const axiosError = error as {
//         response?: { data?: unknown; status?: number };
//         message?: string;
//       };
//       throw new InternalServerErrorException(
//         `Impossible de vérifier le paiement Tranzak ${requestIdToVerify} (HTTP ${axiosError.response?.status ?? 'unknown'}): ${JSON.stringify(axiosError.response?.data ?? axiosError.message)}`,
//       );
//     }
//   }
// }
