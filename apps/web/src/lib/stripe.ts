import { loadStripe } from '@stripe/stripe-js';

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!key) {
  console.error('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY is missing');
}

export const stripePromise = key ? loadStripe(key) : null;
