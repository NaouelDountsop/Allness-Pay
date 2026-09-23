import { useState, useEffect, type ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { stripePromise } from '@/lib/stripe';

const appearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#f97316',
    colorBackground: '#ffffff',
    colorText: '#1a1a2e',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      padding: '12px',
    },
    '.Input:focus': {
      border: '1px solid #f97316',
      boxShadow: '0 0 0 3px rgba(249, 115, 22, 0.1)',
    },
    '.Input--invalid': {
      border: '1px solid #ef4444',
    },
  },
};

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripePromise) {
      setError('Stripe publishable key manquante');
      return;
    }
    stripePromise.then((s) => {
      if (s) {
        setStripe(s);
      } else {
        setError('Stripe.js n\'a pas pu se charger. Vérifiez la clé publique.');
      }
    }).catch((err) => {
      console.error('[Stripe] Failed to load:', err);
      setError(`Erreur de chargement Stripe: ${err.message}`);
    });
  }, []);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
        <p className="font-semibold mb-1">Erreur Stripe</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!stripe) {
    return (
      <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-allness-orange rounded-full animate-spin" />
        Chargement de Stripe...
      </div>
    );
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        appearance,
        ...(clientSecret ? { clientSecret } : {}),
      }}
    >
      {children}
    </Elements>
  );
}
