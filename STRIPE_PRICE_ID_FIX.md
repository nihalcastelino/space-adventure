# 🔧 Fix: Stripe Price ID Error

## ❌ Error You're Seeing

```
No such price: 'prod_TOtJlKZIlana33'
```

**Problem:** You're using a **Product ID** (`prod_...`) instead of a **Price ID** (`price_...`).

---

## ✅ Solution: Get the Correct Price IDs

### Step 1: Go to Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **"Products"** in the left sidebar

### Step 2: Find Your Products

You should see:
- **Space Adventure Monthly Premium** (or similar)
- **Space Adventure Lifetime Premium** (or similar)

### Step 3: Get the Price IDs

For each product:

1. **Click on the product name**
2. Look for the **"Pricing"** section
3. You'll see a table with columns like:
   - **Price ID** (this is what you need!)
   - **Amount**
   - **Billing period**
   - **Currency**

4. **Copy the Price ID** (starts with `price_...`)

**Example:**
- ❌ Wrong: `prod_TOtJlKZIlana33` (Product ID)
- ✅ Correct: `price_1ABC123xyz456` (Price ID)

---

### Step 4: Update Environment Variables

#### In Netlify:

1. Go to Netlify Dashboard → Your site → **Site settings**
2. Click **Environment variables**
3. Update these variables:

```
VITE_STRIPE_PRICE_MONTHLY=price_xxxxx    # Copy from Monthly product
VITE_STRIPE_PRICE_LIFETIME=price_xxxxx   # Copy from Lifetime product
```

4. Click **Save**
5. **Redeploy** your site (or wait for auto-deploy)

---

### Step 5: Verify

After redeploying, try clicking "Subscribe" again. The error should be gone!

---

## 📝 Quick Checklist

- [ ] Went to Stripe Dashboard → Products
- [ ] Clicked on Monthly Premium product
- [ ] Copied the **Price ID** (not Product ID)
- [ ] Clicked on Lifetime Premium product
- [ ] Copied the **Price ID** (not Product ID)
- [ ] Updated `VITE_STRIPE_PRICE_MONTHLY` in Netlify
- [ ] Updated `VITE_STRIPE_PRICE_LIFETIME` in Netlify
- [ ] Redeployed site
- [ ] Tested "Subscribe" button

---

## 🔍 How to Tell the Difference

**Product ID:**
- Starts with `prod_`
- Identifies the product itself
- ❌ Cannot be used for checkout

**Price ID:**
- Starts with `price_`
- Identifies a specific price for a product
- ✅ Required for checkout sessions

---

## 💡 Why This Happens

When you create a product in Stripe, it gives you:
1. A **Product ID** (`prod_...`) - identifies the product
2. A **Price ID** (`price_...`) - identifies the pricing

For checkout sessions, you need the **Price ID**, not the Product ID.

---

## ✅ After Fixing

Once you've updated the Price IDs and redeployed, the checkout should work! You'll be redirected to Stripe Checkout where you can complete the payment.

