import type { PaymentMethodType } from '@/context/deposit-flow.constants';
import { hasMobileMoney, hasMtn, hasOrange, getCountryCode } from './country-currency';

export interface DepositMethodOption {
  key: 'mobile_money' | 'card';
  labelKey: string;
}

export interface MobileOperatorOption {
  key: 'mtn' | 'orange';
  label: string;
  image: string;
}

export interface TontineMethodOption {
  key: PaymentMethodType;
  label: string;
  image: string;
  requiresMobileMoney: boolean;
}

export const ALL_DEPOSIT_METHODS: DepositMethodOption[] = [
  { key: 'mobile_money', labelKey: 'deposit.mobileMoney' },
  { key: 'card', labelKey: 'deposit.bankCard' },
];

export const ALL_MOBILE_OPERATORS: MobileOperatorOption[] = [
  { key: 'mtn', label: 'MTN Mobile Money', image: '/mtn-momo.png' },
  { key: 'orange', label: 'Orange Money', image: '/orange-money.png' },
];

export const ALL_TONTINE_METHODS: TontineMethodOption[] = [
  { key: 'wallet', label: 'Portefeuille Allness', image: '/allnesspay_logo2.png', requiresMobileMoney: false },
  { key: 'mobile_money', label: 'MTN Mobile Money', image: '/mtn-momo.png', requiresMobileMoney: true },
  { key: 'orange_money', label: 'Orange Money', image: '/orange-money.png', requiresMobileMoney: true },
  { key: 'card', label: 'Carte Bancaire', image: '/carte.webp', requiresMobileMoney: false },
];

export function getAvailableDepositMethods(countryCode: string): DepositMethodOption[] {
  const code = getCountryCode(countryCode);
  const mmAvailable = hasMobileMoney(code);
  return ALL_DEPOSIT_METHODS.filter((m) => m.key !== 'mobile_money' || mmAvailable);
}

export function getAvailableMobileOperators(countryCode: string): MobileOperatorOption[] {
  const code = getCountryCode(countryCode);
  return ALL_MOBILE_OPERATORS.filter((op) => {
    if (op.key === 'mtn') return hasMtn(code);
    if (op.key === 'orange') return hasOrange(code);
    return false;
  });
}

export function getAvailableTontineMethods(countryCode: string): TontineMethodOption[] {
  const code = getCountryCode(countryCode);
  const mmAvailable = hasMobileMoney(code);
  return ALL_TONTINE_METHODS.filter((m) => !m.requiresMobileMoney || mmAvailable);
}
