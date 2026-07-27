import { useState, useCallback } from "react";
import { pinService } from "@/lib/api/pin.service";

export function usePin() {
  const [hasPin, setHasPin] = useState(pinService.hasPin());

  const createPin = useCallback((pin: string) => {
    pinService.setPin(pin);
    setHasPin(true);
  }, []);

  const verifyPin = useCallback((pin: string) => {
    return pinService.verifyPin(pin);
  }, []);

  return { hasPin, createPin, verifyPin };
}
