import { LinkedAccountOperator } from '../../modules/linked-account/enums/linked-account-operator.enum';

const MTN_PREFIXES = ['650', '651', '652', '653', '654', '655', '656', '657', '658', '659'];
const ORANGE_PREFIXES = ['690', '691', '692', '693', '694', '695', '696', '697', '698', '699'];

/**
 * Extrait le préfixe national (6 chiffres) d'un numéro camerounais.
 * Gère les formats :
 *  - 6XXYYYZZ   (national brut)
 *  - 237 6XXYYYZZ (avec indicatif pays)
 *  - +237 6XXYYYZZ (avec indicatif pays +)
 */
function extractNationalPrefix(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 9) {
    return digits.substring(0, 3);
  }

  if (digits.length === 12 && digits.startsWith('237')) {
    return digits.substring(3, 6);
  }

  return null;
}

/**
 * Détecte l'opérateur mobile money à partir d'un numéro de téléphone camerounais.
 *
 * Retourne `LinkedAccountOperator.MTN_MOMO` ou `LinkedAccountOperator.ORANGE_MONEY`
 * si le préfixe correspond, sinon `null`.
 */
export function detectOperator(phoneNumber: string): LinkedAccountOperator | null {
  const prefix = extractNationalPrefix(phoneNumber);

  if (!prefix) {
    return null;
  }

  if (MTN_PREFIXES.includes(prefix)) {
    return LinkedAccountOperator.MTN_MOMO;
  }

  if (ORANGE_PREFIXES.includes(prefix)) {
    return LinkedAccountOperator.ORANGE_MONEY;
  }

  return null;
}
