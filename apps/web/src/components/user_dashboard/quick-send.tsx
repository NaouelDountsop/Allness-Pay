import { useState, useRef, useEffect } from 'react';
import { Send, Plus, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/lib/api/transaction.service';
import { walletService } from '@/lib/api/wallet.service';
import { currencyService } from '@/lib/api/currency.service';
import { formatAmount, getCurrencySymbol } from '@/lib/utils';
import { PinConfirmModal } from './send/pin-confirm-modal';
import useManagedCurrencies from '@/lib/hooks/use-managed-currencies';

interface QuickSendContact {
  id: string | number;
  name: string;
  walletNumber: string;
  currency: string;
  avatarUrl?: string | null;
}

interface QuickSendProps {
  contacts: QuickSendContact[];
  walletId?: string;
  isLoading?: boolean;
}

export function QuickSend({ contacts, walletId, isLoading }: QuickSendProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [received, setReceived] = useState('');
  const editingField = useRef<'sender' | 'receiver'>('sender');
  const [selectedContact, setSelectedContact] = useState<QuickSendContact | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data: wallet } = useQuery({
    queryKey: ['wallet-primary'],
    queryFn: walletService.getPrimary,
  });

  const senderCurrency = wallet?.currency ?? 'XAF';
  const receiverCurrency = selectedContact?.currency ?? null;
  const amountNumber = parseFloat(amount) || 0;

  const { set: managedSet, isLoading: managedLoading } = useManagedCurrencies();
  const visibleContacts = managedLoading ? contacts : contacts.filter((c) => managedSet.has(c.currency));

  const hasContact = !!selectedContact;
  const { data: exchangeRate } = useQuery({
    queryKey: ['exchange-rate', senderCurrency, receiverCurrency],
    queryFn: () => currencyService.getExchangeRate(senderCurrency, receiverCurrency!),
    enabled: hasContact && !!receiverCurrency && senderCurrency !== receiverCurrency,
  });

  const rate = exchangeRate?.rate ?? (hasContact && senderCurrency === receiverCurrency ? 1 : null);
  const receivedNumber = parseFloat(received) || 0;
  const showConversion = hasContact && receiverCurrency !== null && senderCurrency !== receiverCurrency && rate !== null;
  const receivedAmount = hasContact && rate !== null
    ? (editingField.current === 'sender' ? amountNumber * rate : receivedNumber)
    : null;

  useEffect(() => {
    if (hasContact && rate && editingField.current === 'sender' && amountNumber > 0) {
      setReceived((amountNumber * rate).toFixed(2));
    } else if (hasContact && amountNumber === 0) {
      setReceived('');
    }
  }, [rate, hasContact, amountNumber]);

  const transferMutation = useMutation({
    mutationFn: (pin: string) =>
      transactionService.createTransfer(walletId!, {
        toWalletId: selectedContact!.walletNumber,
        amount,
        description: `Envoi rapide vers ${selectedContact!.name}`,
        pin,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-primary'] });
      setSuccess(true);
      setError('');
      setShowPin(false);
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      const msg = err.response?.data?.message ?? err.message ?? '';
      if (msg.includes('Solde insuffisant') || msg.includes('insufficient') || msg.includes('insuffisant')) {
        setError(t('tontines.insufficientBalance'));
      } else {
        setError(msg || t('tontines.transferError'));
      }
      setShowPin(false);
    },
  });

  const handleSend = () => {
    if (!selectedContact || !amount || !walletId) return;
    setError('');
    setShowPin(true);
  };

  const handlePinConfirm = async (pin: string): Promise<string | null> => {
    try {
      await transferMutation.mutateAsync(pin);
      return null;
    } catch {
      return t('tontines.transferError');
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center text-center py-6">
          <span className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-allness-green" />
          </span>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('tontines.transferSent')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {amount} {selectedContact?.currency} envoyés à {selectedContact?.name}
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setAmount('');
              setReceived('');
              setSelectedContact(null);
            }}
            className="h-9 px-4 rounded-lg bg-allness-green text-white text-xs font-medium hover:opacity-90"
          >
            {t('tontines.newTransfer')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('tontines.quickSend')}</h3>
        <a
          href="/dashboard/beneficiaries"
          className="shrink-0 whitespace-nowrap text-xs text-allness-orange font-semibold hover:underline underline-offset-2 transition-colors"
        >
          {t('tontines.viewAll')}
        </a>
      </div>

      <div className="flex gap-3 mb-5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {isLoading ? (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
                <div className="w-8 h-2 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {visibleContacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedContact(c);
                  setReceived('');
                  editingField.current = 'sender';
                }}
                className={`flex flex-col items-center gap-1 group shrink-0 snap-start ${
                  selectedContact?.id === c.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200 overflow-hidden ring-2 ${
                  selectedContact?.id === c.id ? 'ring-allness-orange' : 'ring-transparent group-hover:ring-allness-orange/50'
                } transition-all`}>
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    c.name.charAt(0)
                  )}
                </div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 max-w-[52px] truncate">{c.name}</span>
              </button>
            ))}
            <div className="flex flex-col items-center gap-1 shrink-0 snap-start">
              <button
                type="button"
                aria-label={t('tontines.addBeneficiary')}
                onClick={() => { window.location.href = '/dashboard/beneficiaries'; }}
                className="w-11 h-11 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-allness-orange hover:text-allness-orange transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">{t('tontines.new')}</span>
            </div>
          </>
        )}
      </div>

      {selectedContact && (
        <div className="mb-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-[10px] font-medium text-gray-700 dark:text-gray-200">
              {selectedContact.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{selectedContact.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{selectedContact.walletNumber}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          placeholder={t('tontines.enterAmount')}
          value={amount}
          onChange={(e) => {
            editingField.current = 'sender';
            const val = e.target.value;
            setAmount(val);
            const num = parseFloat(val) || 0;
            if (showConversion && rate) {
              setReceived(num > 0 ? (num * rate).toFixed(2) : '');
            }
          }}
          className="flex-1 min-w-[140px] h-11 rounded-lg border border-gray-200 dark:border-gray-600 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus-visible:outline-allness-orange/60 focus:ring-2 focus:ring-allness-orange/40 focus:border-allness-orange/50"
        />
        <div className="h-11 min-w-[72px] rounded-lg border border-gray-200 dark:border-gray-600 px-3 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
          {senderCurrency}
        </div>
      </div>

      {selectedContact && (
        <div className="rounded-lg bg-allness-orange/5 border border-allness-orange/20 p-2.5 mb-3">
          {showConversion && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
              Taux : 1 {senderCurrency} = {formatAmount(rate!, receiverCurrency!)}
            </p>
          )}
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Montant reçu"
              value={editingField.current === 'sender' ? (receivedAmount ? Number(receivedAmount).toFixed(2) : '') : received}
              onChange={(e) => {
                editingField.current = 'receiver';
                const val = e.target.value;
                setReceived(val);
                const num = parseFloat(val) || 0;
                if (showConversion && rate) {
                  setAmount(num > 0 ? (num / rate).toFixed(2) : '');
                }
              }}
              className="flex-1 h-9 rounded-lg border border-allness-orange/30 px-3 text-xs bg-white dark:bg-gray-800 text-allness-orange font-semibold focus:outline-none focus:ring-2 focus:ring-allness-orange/30"
            />
            <span className="text-xs font-medium text-allness-orange">{getCurrencySymbol(receiverCurrency)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-2.5 text-xs text-red-700 dark:text-red-400 mb-3">
          {error}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={!selectedContact || !amount}
        className="w-full h-11 rounded-lg bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] text-allness-orange dark:text-gray-900 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        {t('tontines.sendNow')}
      </button>

      {showPin && walletId && (
        <PinConfirmModal
          walletId={walletId}
          onConfirm={handlePinConfirm}
          onClose={() => setShowPin(false)}
        />
      )}
    </div>
  );
}
