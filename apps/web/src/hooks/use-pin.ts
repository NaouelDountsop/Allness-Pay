import { useState, useCallback } from 'react';
import { pinService } from '@/lib/api/pin.service';

export function usePin(walletId: string | null) {
  const [hasPin, setHasPin] = useState(false);

  const checkPinStatus = useCallback(async () => {
    if (!walletId) return;
    try {
      const status = await pinService.getStatus(walletId);
      setHasPin(status.hasPin);
    } catch {
      setHasPin(false);
    }
  }, [walletId]);

  const createPin = useCallback(
    async (pin: string) => {
      if (!walletId) throw new Error('Aucun portefeuille sélectionné');
      await pinService.create(walletId, pin);
      setHasPin(true);
    },
    [walletId],
  );

  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!walletId) return false;
      return pinService.verify(walletId, pin);
    },
    [walletId],
  );

  return { hasPin, createPin, verifyPin, checkPinStatus };
}
