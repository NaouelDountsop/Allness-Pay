import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletsService } from '../wallet/wallet.service';
import { PinService } from '../pin/pin.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet-operation.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly walletsService: WalletsService,
    private readonly pinService: PinService,
  ) {}

  async deposit(id: string, userId: string, dto: DepositDto): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await this.walletsService.lockWalletForUpdate(manager, id);
      this.walletsService.assertOwnership(wallet, userId);
      this.walletsService.assertActive(wallet);

      // Le dépôt ne touche jamais au PIN : c'est une opération entrante,
      // non sensible au même titre qu'un retrait ou un transfert.
      await manager.increment(Wallet, { id }, 'balance', Number(dto.amount));
      return manager.findOneOrFail(Wallet, { where: { id } });

      // Point d'extension: créer ici une entrée dans une table WalletTransaction
      // (type: 'deposit', amount, description, walletId, createdAt) pour l'audit.
    });
  }

  async withdraw(id: string, userId: string, dto: WithdrawDto): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      // verifyPinWithManager verrouille déjà la ligne (FOR UPDATE) dans
      // cette même transaction : verrou + PIN + solde restent atomiques.
      const wallet = await this.pinService.verifyPinWithManager(manager, id, userId, dto.pin);
      this.walletsService.assertActive(wallet);

      const currentBalance = Number(wallet.balance);
      const amount = Number(dto.amount);
      if (currentBalance < amount) {
        throw new BadRequestException('Solde insuffisant');
      }

      await manager.decrement(Wallet, { id }, 'balance', amount);
      return manager.findOneOrFail(Wallet, { where: { id } });

      // Point d'extension: entrée WalletTransaction (type: 'withdrawal').
    });
  }

  async transfer(
    fromId: string,
    userId: string,
    dto: TransferDto,
  ): Promise<{ from: Wallet; to: Wallet }> {
    if (fromId === dto.toWalletId) {
      throw new BadRequestException('Impossible de transférer vers le même wallet');
    }

    return this.dataSource.transaction(async (manager) => {
      // Verrouillage dans un ordre déterministe (tri des UUID), AVANT toute
      // logique métier : évite un deadlock entre deux transferts concurrents
      // en sens inverse (A→B en même temps que B→A), qui sinon verrouillent
      // chacun leur source puis attendent la destination de l'autre.
      const [firstId, secondId] = [fromId, dto.toWalletId].sort();
      await this.walletsService.lockWalletForUpdate(manager, firstId);
      await this.walletsService.lockWalletForUpdate(manager, secondId);

      // Les lignes sont déjà verrouillées ci-dessus : ces appels relisent les
      // données (avec le PIN pour la source) sans réordonner les verrous.
      const fromWallet = await this.pinService.verifyPinWithManager(manager, fromId, userId, dto.pin);
      this.walletsService.assertActive(fromWallet);

      const toWallet = await this.walletsService.lockWalletForUpdate(manager, dto.toWalletId);
      this.walletsService.assertActive(toWallet);

      if (fromWallet.currency !== toWallet.currency) {
        throw new BadRequestException(
          'Transfert entre devises différentes non supporté pour le moment',
        );
      }

      const amount = Number(dto.amount);
      if (Number(fromWallet.balance) < amount) {
        throw new BadRequestException('Solde insuffisant');
      }

      await manager.decrement(Wallet, { id: fromWallet.id }, 'balance', amount);
      await manager.increment(Wallet, { id: toWallet.id }, 'balance', amount);

      const [updatedFrom, updatedTo] = await Promise.all([
        manager.findOneOrFail(Wallet, { where: { id: fromWallet.id } }),
        manager.findOneOrFail(Wallet, { where: { id: toWallet.id } }),
      ]);

      // Point d'extension: deux entrées WalletTransaction liées
      // (type: 'transfer_out' / 'transfer_in') pour tracer l'opération.

      return { from: updatedFrom, to: updatedTo };
    });
  }
}