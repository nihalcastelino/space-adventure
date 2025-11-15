// Payment Provider Configuration with Geo-Detection and Adaptive Pricing
// Adapted from bible-api for Space Adventure

export const REGION_CONFIG = {
  // India - Stripe with Indian Payment Methods
  IN: {
    provider: 'stripe',
    currency: 'INR',
    country: 'India',
    countryCode: 'IN',
    paymentMethods: ['UPI', 'Cards', 'NetBanking', 'Wallets'],
    stripePaymentMethods: ['card', 'upi', 'netbanking_', 'paytm'],
    pricing: {
      premium: {
        monthly: 299, // ₹299/month (~$3.60) - Adjusted for PPP
        lifetime: 1999, // ₹1,999 (~$24) - One-time
      },
      coins: {
        small: 99, // ₹99 (~$1.20)
        medium: 299, // ₹299 (~$3.60)
        large: 499, // ₹499 (~$6)
        xlarge: 999, // ₹999 (~$12)
        mega: 1999, // ₹1,999 (~$24)
      },
    },
    stripePriceIds: {
      premium_monthly: '', // Set after creating in Stripe
      premium_lifetime: '', // Set after creating in Stripe
      coins_small: '',
      coins_medium: '',
      coins_large: '',
      coins_xlarge: '',
      coins_mega: '',
    },
  },

  // United States - Stripe
  US: {
    provider: 'stripe',
    currency: 'USD',
    country: 'United States',
    countryCode: 'US',
    paymentMethods: ['Card', 'Apple Pay', 'Google Pay'],
    stripePaymentMethods: ['card'],
    pricing: {
      premium: {
        monthly: 4.99, // $4.99/month
        lifetime: 19.99, // $19.99 one-time
      },
      coins: {
        small: 0.99, // $0.99
        medium: 2.99, // $2.99
        large: 4.99, // $4.99
        xlarge: 9.99, // $9.99
        mega: 19.99, // $19.99
      },
    },
    stripePriceIds: {
      premium_monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
      premium_lifetime: import.meta.env.VITE_STRIPE_PRICE_LIFETIME || '',
      coins_small: import.meta.env.VITE_STRIPE_PRICE_COINS_SMALL || '',
      coins_medium: import.meta.env.VITE_STRIPE_PRICE_COINS_MEDIUM || '',
      coins_large: import.meta.env.VITE_STRIPE_PRICE_COINS_LARGE || '',
      coins_xlarge: import.meta.env.VITE_STRIPE_PRICE_COINS_XLARGE || '',
      coins_mega: import.meta.env.VITE_STRIPE_PRICE_COINS_MEGA || '',
    },
  },

  // United Kingdom - Stripe
  GB: {
    provider: 'stripe',
    currency: 'GBP',
    country: 'United Kingdom',
    countryCode: 'GB',
    paymentMethods: ['Card', 'Apple Pay', 'Google Pay'],
    stripePaymentMethods: ['card'],
    pricing: {
      premium: {
        monthly: 3.99, // £3.99/month
        lifetime: 15.99, // £15.99 one-time
      },
      coins: {
        small: 0.79, // £0.79
        medium: 2.49, // £2.49
        large: 3.99, // £3.99
        xlarge: 7.99, // £7.99
        mega: 15.99, // £15.99
      },
    },
    stripePriceIds: {
      premium_monthly: '',
      premium_lifetime: '',
      coins_small: '',
      coins_medium: '',
      coins_large: '',
      coins_xlarge: '',
      coins_mega: '',
    },
  },

  // Australia - Stripe
  AU: {
    provider: 'stripe',
    currency: 'AUD',
    country: 'Australia',
    countryCode: 'AU',
    paymentMethods: ['Card', 'Apple Pay', 'Google Pay'],
    stripePaymentMethods: ['card'],
    pricing: {
      premium: {
        monthly: 6.99, // AU$6.99/month
        lifetime: 29.99, // AU$29.99 one-time
      },
      coins: {
        small: 1.49, // AU$1.49
        medium: 4.49, // AU$4.49
        large: 6.99, // AU$6.99
        xlarge: 14.99, // AU$14.99
        mega: 29.99, // AU$29.99
      },
    },
    stripePriceIds: {
      premium_monthly: '',
      premium_lifetime: '',
      coins_small: '',
      coins_medium: '',
      coins_large: '',
      coins_xlarge: '',
      coins_mega: '',
    },
  },

  // European Union - Stripe
  EU: {
    provider: 'stripe',
    currency: 'EUR',
    country: 'Europe',
    countryCode: 'EU',
    paymentMethods: ['Card', 'Apple Pay', 'Google Pay'],
    stripePaymentMethods: ['card'],
    pricing: {
      premium: {
        monthly: 4.99, // €4.99/month
        lifetime: 19.99, // €19.99 one-time
      },
      coins: {
        small: 0.99, // €0.99
        medium: 2.99, // €2.99
        large: 4.99, // €4.99
        xlarge: 9.99, // €9.99
        mega: 19.99, // €19.99
      },
    },
    stripePriceIds: {
      premium_monthly: '',
      premium_lifetime: '',
      coins_small: '',
      coins_medium: '',
      coins_large: '',
      coins_xlarge: '',
      coins_mega: '',
    },
  },

  // Pakistan, Bangladesh, Sri Lanka - Stripe with Cards (PPP pricing)
  PK: {
    provider: 'stripe',
    currency: 'USD', // Use USD (PKR has conversion issues)
    country: 'Pakistan',
    countryCode: 'PK',
    paymentMethods: ['Cards'],
    stripePaymentMethods: ['card'],
    pricing: {
      premium: {
        monthly: 2.99, // $2.99/month (PPP adjusted)
        lifetime: 14.99, // $14.99 one-time
      },
      coins: {
        small: 0.49, // $0.49
        medium: 1.99, // $1.99
        large: 2.99, // $2.99
        xlarge: 5.99, // $5.99
        mega: 14.99, // $14.99
      },
    },
    stripePriceIds: {
      premium_monthly: '',
      premium_lifetime: '',
      coins_small: '',
      coins_medium: '',
      coins_large: '',
      coins_xlarge: '',
      coins_mega: '',
    },
  },

  BD: {
    provider: 'stripe',
    currency: 'USD',
    country: 'Bangladesh',
    countryCode: 'BD',
    paymentMethods: ['Cards'],
    stripePaymentMethods: ['card'],
    pricing: {
      premium: {
        monthly: 2.99,
        lifetime: 14.99,
      },
      coins: {
        small: 0.49,
        medium: 1.99,
        large: 2.99,
        xlarge: 5.99,
        mega: 14.99,
      },
    },
    stripePriceIds: {
      premium_monthly: '',
      premium_lifetime: '',
      coins_small: '',
      coins_medium: '',
      coins_large: '',
      coins_xlarge: '',
      coins_mega: '',
    },
  },

  LK: {
    provider: 'stripe',
    currency: 'USD',
    country: 'Sri Lanka',
    countryCode: 'LK',
    paymentMethods: ['Cards'],
    stripePaymentMethods: ['card'],
    pricing: {
      premium: {
        monthly: 2.99,
        lifetime: 14.99,
      },
      coins: {
        small: 0.49,
        medium: 1.99,
        large: 2.99,
        xlarge: 5.99,
        mega: 14.99,
      },
    },
    stripePriceIds: {
      premium_monthly: '',
      premium_lifetime: '',
      coins_small: '',
      coins_medium: '',
      coins_large: '',
      coins_xlarge: '',
      coins_mega: '',
    },
  },

  // Default fallback (Stripe - USD)
  DEFAULT: {
    provider: 'stripe',
    currency: 'USD',
    country: 'Global',
    countryCode: 'DEFAULT',
    paymentMethods: ['Card'],
    stripePaymentMethods: ['card'],
    pricing: {
      premium: {
        monthly: 4.99,
        lifetime: 19.99,
      },
      coins: {
        small: 0.99,
        medium: 2.99,
        large: 4.99,
        xlarge: 9.99,
        mega: 19.99,
      },
    },
    stripePriceIds: {
      premium_monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
      premium_lifetime: import.meta.env.VITE_STRIPE_PRICE_LIFETIME || '',
      coins_small: import.meta.env.VITE_STRIPE_PRICE_COINS_SMALL || '',
      coins_medium: import.meta.env.VITE_STRIPE_PRICE_COINS_MEDIUM || '',
      coins_large: import.meta.env.VITE_STRIPE_PRICE_COINS_LARGE || '',
      coins_xlarge: import.meta.env.VITE_STRIPE_PRICE_COINS_XLARGE || '',
      coins_mega: import.meta.env.VITE_STRIPE_PRICE_COINS_MEGA || '',
    },
  },
};

/**
 * Detect user's region based on various methods
 * Priority: 1. IP-based geolocation, 2. Browser locale, 3. Default
 */
export async function detectUserRegion() {
  try {
    // Method 1: Try IP-based geolocation (using free ipapi.co service)
    const ipResponse = await fetch('https://ipapi.co/json/', {
      cache: 'no-store', // Don't cache for now
    });

    if (ipResponse.ok) {
      const ipData = await ipResponse.json();
      const countryCode = ipData.country_code;

      if (countryCode && REGION_CONFIG[countryCode]) {
        console.log(`🌍 Detected region from IP: ${countryCode} (${ipData.country_name})`);
        return REGION_CONFIG[countryCode];
      }
    }
  } catch (error) {
    console.warn('IP geolocation failed:', error);
  }

  try {
    // Method 2: Browser locale fallback
    if (typeof window !== 'undefined') {
      const locale = navigator.language || 'en-US';
      const countryCode = locale.split('-')[1]?.toUpperCase();

      if (countryCode && REGION_CONFIG[countryCode]) {
        console.log(`🌍 Detected region from locale: ${countryCode}`);
        return REGION_CONFIG[countryCode];
      }
    }
  } catch (error) {
    console.warn('Locale detection failed:', error);
  }

  // Method 3: Default fallback
  console.log('🌍 Using default region (USD)');
  return REGION_CONFIG.DEFAULT;
}

/**
 * Get region config by country code
 */
export function getRegionConfig(countryCode) {
  return REGION_CONFIG[countryCode] || REGION_CONFIG.DEFAULT;
}

/**
 * Get formatted price string
 */
export function formatPrice(amount, currency) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  });

  return formatter.format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency) {
  const symbols = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    AUD: 'AU$',
    INR: '₹',
  };
  return symbols[currency] || '$';
}

