#!/usr/bin/env node
/**
 * Script to automatically create Stripe products and prices for Space Adventure
 * 
 * Usage:
 *   node scripts/create-stripe-products.js
 * 
 * Requirements:
 *   - STRIPE_SECRET_KEY in .env file
 */

import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file manually
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env');
    console.log('📄 Looking for .env file at:', envPath);
    const envFile = readFileSync(envPath, 'utf-8');
    const envVars = {};
    let loadedCount = 0;
    
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          envVars[key.trim()] = value.trim();
          loadedCount++;
        }
      }
    });
    
    // Set process.env
    Object.assign(process.env, envVars);
    console.log(`✅ Loaded ${loadedCount} environment variables from .env file`);
  } catch (error) {
    console.warn('⚠️  Could not load .env file:', error.message);
    console.warn('   Using process.env directly (make sure STRIPE_SECRET_KEY is set)');
  }
}

loadEnvFile();

// Initialize Stripe (will be validated in createProducts function)
let stripe;

async function createProducts() {
  console.log('🚀 Creating Stripe products and prices for Space Adventure...\n');
  console.log('📁 Script location:', import.meta.url);
  console.log('🔑 Checking for Stripe key...');

  const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY or VITE_STRIPE_SECRET_KEY not found in .env file');
    console.error('   Please add one of these to your .env file:');
    console.error('   STRIPE_SECRET_KEY=sk_test_xxxxx');
    console.error('   or');
    console.error('   VITE_STRIPE_SECRET_KEY=sk_test_xxxxx');
    process.exit(1);
  }

  console.log('✅ Stripe key found:', stripeKey.substring(0, 12) + '...\n');

  // Initialize Stripe with the key
  stripe = new Stripe(stripeKey, {
    apiVersion: '2025-10-29.clover',
  });

  try {
    const priceIds = {};

    // 1. Premium Monthly Subscription
    console.log('📦 Creating Premium Monthly subscription...');
    const premiumMonthlyProduct = await stripe.products.create({
      name: 'Space Adventure Premium Monthly',
      description: 'Monthly premium subscription - All difficulties, variants, no ads, 50% more coins',
      metadata: {
        tier: 'premium_monthly',
        type: 'subscription',
      },
    });
    console.log('  ✅ Product created:', premiumMonthlyProduct.id);

    const premiumMonthlyPrice = await stripe.prices.create({
      product: premiumMonthlyProduct.id,
      unit_amount: 499, // $4.99
      currency: 'usd',
      recurring: { interval: 'month' },
      nickname: 'Premium Monthly (USD)',
    });
    priceIds.premium_monthly_usd = premiumMonthlyPrice.id;
    console.log('  ✅ Price created:', premiumMonthlyPrice.id, '($4.99/month)');

    // 2. Premium Lifetime (One-time payment)
    console.log('\n📦 Creating Premium Lifetime...');
    const premiumLifetimeProduct = await stripe.products.create({
      name: 'Space Adventure Premium Lifetime',
      description: 'Lifetime premium access - All features forever, no recurring payments',
      metadata: {
        tier: 'premium_lifetime',
        type: 'one_time',
      },
    });
    console.log('  ✅ Product created:', premiumLifetimeProduct.id);

    const premiumLifetimePrice = await stripe.prices.create({
      product: premiumLifetimeProduct.id,
      unit_amount: 1999, // $19.99
      currency: 'usd',
      nickname: 'Premium Lifetime (USD)',
    });
    priceIds.premium_lifetime_usd = premiumLifetimePrice.id;
    console.log('  ✅ Price created:', premiumLifetimePrice.id, '($19.99 one-time)');

    // 3. Coin Packages (One-time payments)
    console.log('\n📦 Creating Coin Packages...');

    const coinPackages = [
      { name: 'Small Coin Pack', coins: 100, price: 99, id: 'coins_small' },
      { name: 'Medium Coin Pack', coins: 350, price: 299, id: 'coins_medium', bonus: 50 },
      { name: 'Large Coin Pack', coins: 650, price: 499, id: 'coins_large', bonus: 100 },
      { name: 'X-Large Coin Pack', coins: 1500, price: 999, id: 'coins_xlarge', bonus: 300 },
      { name: 'Mega Coin Pack', coins: 3500, price: 1999, id: 'coins_mega', bonus: 1000 },
    ];

    for (const pkg of coinPackages) {
      const product = await stripe.products.create({
        name: `Space Adventure ${pkg.name}`,
        description: `${pkg.coins} coins${pkg.bonus ? ` + ${pkg.bonus} bonus` : ''}`,
        metadata: {
          type: 'coins',
          coins: pkg.coins.toString(),
          bonus: (pkg.bonus || 0).toString(),
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price, // in cents
        currency: 'usd',
        nickname: `${pkg.name} (USD)`,
      });

      priceIds[pkg.id] = price.id;
      console.log(`  ✅ ${pkg.name}: ${price.id} ($${(pkg.price / 100).toFixed(2)})`);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 COPY THESE PRICE IDs TO YOUR .env FILE:\n');
    console.log('# Stripe Price IDs (created automatically)');
    console.log(`VITE_STRIPE_PRICE_MONTHLY=${priceIds.premium_monthly_usd}`);
    console.log(`VITE_STRIPE_PRICE_LIFETIME=${priceIds.premium_lifetime_usd}`);
    console.log(`VITE_STRIPE_PRICE_COINS_SMALL=${priceIds.coins_small}`);
    console.log(`VITE_STRIPE_PRICE_COINS_MEDIUM=${priceIds.coins_medium}`);
    console.log(`VITE_STRIPE_PRICE_COINS_LARGE=${priceIds.coins_large}`);
    console.log(`VITE_STRIPE_PRICE_COINS_XLARGE=${priceIds.coins_xlarge}`);
    console.log(`VITE_STRIPE_PRICE_COINS_MEGA=${priceIds.coins_mega}`);
    console.log('\n' + '='.repeat(60));

    console.log('\n✨ All products created successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Copy the Price IDs above to your .env file');
    console.log('2. Set up webhook endpoint in Stripe Dashboard');
    console.log('3. Add webhook secret to .env: STRIPE_WEBHOOK_SECRET=whsec_...');
    console.log('4. Test checkout flow with Stripe test cards');

    return priceIds;
  } catch (error) {
    console.error('❌ Error creating products:', error);
    throw error;
  }
}

// Always run when script is executed directly
createProducts()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  });

export { createProducts };

