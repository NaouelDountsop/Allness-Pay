// ⚠️ Implémentation temporaire en localStorage.
// À remplacer par des appels réels à ton backend NestJS
// (ex: POST /auth/pin/setup, POST /auth/pin/verify), le PIN
// ne devant jamais être stocké en clair côté client en production.

const PIN_KEY = "afrilink_transaction_pin";

export const pinService = {
  hasPin: (): boolean => {
    return !!localStorage.getItem(PIN_KEY);
  },
  setPin: (pin: string) => {
    localStorage.setItem(PIN_KEY, pin);
  },
  verifyPin: (pin: string): boolean => {
    return localStorage.getItem(PIN_KEY) === pin;
  },
};
