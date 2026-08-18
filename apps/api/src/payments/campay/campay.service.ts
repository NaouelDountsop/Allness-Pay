import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TransactionsService } from '../../modules/transactions/transactions.service';
import { WalletTransactionStatus } from '../../modules/transactions/entities/wallet-transaction.entity';
import { WalletsService } from '../../modules/wallet/wallet.service';
import { detectOperator, normalizePhoneForCampay } from '../../common/utils/phone-operator.util';
import { CampayPaymentDto } from './dto/campay-payment.dto';
import { ProvidersConfig } from '../../config/configuration';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from '../../modules/transactions/entities/wallet-transaction.entity';
import { Wallet } from '../../modules/wallet/entities/wallet.entity';

@Injectable()
export class CampayService {
  private readonly logger = new Logger(CampayService.name);
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionsService: TransactionsService,
    private readonly walletsService: WalletsService,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepo: Repository<WalletTransaction>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
  ) {
    const campayConfig =
      this.configService.getOrThrow<ProvidersConfig['campay']>('providers.campay');
    this.baseUrl = campayConfig.baseUrl;
    this.username = campayConfig.username;
    this.password = campayConfig.password;
    console.warn('Campay config loaded:', { baseUrl: this.baseUrl, username: this.username.substring(0, 10) + '...' });
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/api/token/`, {
        username: this.username,
        password: this.password,
      });

      const token = response.data.token as string;
      if (!token) {
        throw new InternalServerErrorException('Token Campay vide');
      }

      this.accessToken = token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in ?? 3600) * 1000 - 60_000;
      return this.accessToken;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      throw new InternalServerErrorException(
        `Impossible de récupérer le token Campay: ${JSON.stringify(axiosError.response?.data) || axiosError.message}`,
      );
    }
  }

  async requestPayment(dto: CampayPaymentDto, userId: number): Promise<{
    transactionId: string;
    status: string;
    reference: string;
  }> {
    const wallet = await this.walletsService.findByWalletNumber(dto.walletNumber);
    this.walletsService.assertOwnership(wallet, userId);
    this.walletsService.assertActive(wallet);

    const operator = detectOperator(dto.phone_number);
    if (!operator) {
      throw new BadRequestException(
        'Numéro de téléphone non reconnu. Préfixes acceptés — MTN : 650-654, 670-679, 680-683 / Orange : 640, 655-659, 686-699.',
      );
    }

    const amount = parseInt(dto.amount, 10);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Le montant doit être un nombre positif');
    }

    const reference = `CMP-${Date.now()}-${userId}`;
    const phoneFormatted = normalizePhoneForCampay(dto.phone_number);

    this.logger.log(`Campay request: from=${phoneFormatted}, amount=${dto.amount}, ref=${reference}`);

    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/api/collect/`,
        {
          amount: dto.amount,
          currency: 'XAF',
          from: phoneFormatted,
          description: dto.description ?? 'Dépôt AllnessPay',
          external_reference: reference,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const campayData = response.data;

      if (!campayData.reference) {
        throw new InternalServerErrorException(
          `Réponse Campay invalide : reference manquante. Réponse complète: ${JSON.stringify(campayData)}`,
        );
      }

      const transaction = await this.transactionsService.recordExternalPayment({
        walletId: wallet.id,
        amount: BigInt(dto.amount),
        operator,
        phoneNumber: dto.phone_number,
        description: dto.description ?? 'Dépôt via Campay',
        provider: 'CAMPAY',
        providerRequestId: campayData.reference,
        providerTransactionId: campayData.id ?? null,
        reference,
      });

      return {
        transactionId: transaction.id,
        status: campayData.status ?? 'PENDING',
        reference: campayData.reference,
      };
    } catch (error: unknown) {
      if (error instanceof InternalServerErrorException) throw error;
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      throw new InternalServerErrorException(
        `Impossible de créer le paiement Campay: ${JSON.stringify(axiosError.response?.data) || axiosError.message}`,
      );
    }
  }

  async handleCallback(reference: string, status: string) {
    this.logger.log(`Callback Campay reçu: reference=${reference}, status=${status}`);

    const verifiedStatus = await this.verifyPaymentStatus(reference);
    this.logger.log(`Callback verified status for ${reference}: ${verifiedStatus}`);

    const campayStatus =
      verifiedStatus === 'SUCCESSFUL'
        ? WalletTransactionStatus.COMPLETED
        : WalletTransactionStatus.FAILED;

    return this.transactionsService.confirmExternalPayment(
      'CAMPAY',
      reference,
      campayStatus,
      true,
    );
  }

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

  async verifyAndConfirmPayment(
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

    if (
      transaction.status === WalletTransactionStatus.COMPLETED ||
      transaction.status === WalletTransactionStatus.FAILED
    ) {
      return {
        status: transaction.status,
        amount: transaction.amount.toString(),
      };
    }

    const identifier = transaction.providerRequestId ?? transaction.providerTransactionId;
    if (identifier) {
      this.verifyInBackground(transaction, identifier).catch((err) => {
        this.logger.error(`Background verify failed for ${identifier}: ${err.message}`);
      });
    }

    return {
      status: transaction.status,
      amount: transaction.amount.toString(),
    };
  }

  private async verifyInBackground(
    transaction: WalletTransaction,
    identifier: string,
  ): Promise<void> {
    try {
      const verifiedStatus = await this.verifyPaymentStatus(identifier);
      this.logger.log(`Background verify ${identifier}: Campay status = ${verifiedStatus}`);

      const newStatus =
        verifiedStatus === 'SUCCESSFUL'
          ? WalletTransactionStatus.COMPLETED
          : verifiedStatus === 'PENDING'
            ? transaction.status
            : WalletTransactionStatus.FAILED;

      if (
        newStatus !== transaction.status &&
        (newStatus === WalletTransactionStatus.COMPLETED ||
          newStatus === WalletTransactionStatus.FAILED)
      ) {
        this.logger.log(`Background verify ${identifier}: updating DB from ${transaction.status} to ${newStatus}`);
        await this.transactionsService.confirmExternalPayment(
          'CAMPAY',
          identifier,
          newStatus,
          !!transaction.providerRequestId,
        );
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(`Background verify ${identifier} failed: ${err.message}`);
    }
  }

  private async verifyPaymentStatus(reference: string): Promise<string> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(`${this.baseUrl}/api/transaction/${reference}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      return response.data?.status ?? 'FAILED';
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      throw new InternalServerErrorException(
        `Impossible de vérifier le paiement Campay ${reference} (HTTP ${axiosError.response?.status ?? 'unknown'}): ${JSON.stringify(axiosError.response?.data ?? axiosError.message)}`,
      );
    }
  }
}
