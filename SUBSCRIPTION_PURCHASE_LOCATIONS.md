# 💳 Where Users Can Purchase Subscriptions

## 📍 Purchase Locations

Users can access the subscription purchase options in **3 main places**:

---

### 1. **Main Menu - Game Mode Selector** ⭐ (Primary Entry Point)

**Location:** When users first open the game (main menu)

**How it appears:**
- When users try to select **premium-gated features**:
  - **Difficulty levels:** Hard, Extreme, Nightmare, Chaos (locked with 🔒 icon)
  - **Game variants:** Sprint, Marathon, Checkpoint Challenge, etc. (shows "Premium" badge)
- When users hit **freemium limits** (daily game limits)
- Clicking locked features triggers the Premium Modal

**User Flow:**
1. User sees locked difficulty/variant
2. Clicks on it
3. Premium Modal opens with subscription options
4. User selects Monthly ($4.99) or Lifetime ($19.99)
5. Redirected to Stripe Checkout
6. After payment, redirected back and premium is active

---

### 2. **User Profile** ⭐ (Direct Access)

**Location:** User Profile Modal (click user name/avatar → "View Profile")

**How it appears:**
- **For Free Users:**
  - Shows "Unlock Premium Features" card
  - Big yellow "Upgrade to Premium" button
  - Lists benefits (all difficulties, variants, no ads, etc.)
  
- **For Premium Users:**
  - Shows current subscription status
  - Tier name (Monthly/Lifetime)
  - Expiration date (if monthly)
  - Days remaining
  - Cancel subscription option

**User Flow:**
1. User clicks their name/avatar (top right)
2. Selects "View Profile"
3. Sees "Upgrade to Premium" button (if not premium)
4. Clicks button → Premium Modal opens
5. Selects subscription → Stripe Checkout → Premium activated

---

### 3. **Game Settings** (During Game)

**Location:** Settings modal during gameplay

**How it appears:**
- When users try to change difficulty to premium-only levels
- Shows lock icon and "Premium feature" message
- "Upgrade" button appears

**User Flow:**
1. User opens Settings during game
2. Tries to select Hard/Extreme/Nightmare/Chaos
3. Sees "Premium feature - Unlock with subscription"
4. Clicks "Upgrade" → Premium Modal opens

---

## 🎯 Premium Modal Features

The Premium Modal shows:

### **Three Tiers:**

1. **Free** (Current for non-premium users)
   - Basic features
   - Limited game modes
   - Ads shown

2. **Monthly Premium** - $4.99/month
   - All difficulty levels
   - All game variants
   - No ads
   - 50% more coins
   - 50 bonus coins daily
   - Exclusive power-ups

3. **Lifetime Premium** - $19.99 (one-time)
   - Everything in Monthly
   - 100% more coins
   - 100 bonus coins daily
   - One-time payment
   - Best value badge

### **Actions Available:**

- **Subscribe** (Monthly) - Redirects to Stripe Checkout
- **Buy Now** (Lifetime) - Redirects to Stripe Checkout
- **Cancel Subscription** (if monthly active)
- **Restore Purchases** - Reloads premium status from Supabase

---

## 🔄 Complete Purchase Flow

1. **User clicks "Upgrade" or locked feature**
2. **Premium Modal opens** with tier options
3. **User selects Monthly or Lifetime**
4. **Clicks "Subscribe" or "Buy Now"**
5. **Redirected to Stripe Checkout**
   - Uses test card: `4242 4242 4242 4242`
   - Or real payment method
6. **Completes payment**
7. **Redirected back to app** (`?checkout=success`)
8. **Webhook processes payment** (Stripe → Netlify Function → Supabase)
9. **Premium status updated** in database
10. **User sees premium features unlocked** immediately

---

## 📱 Visual Indicators

### **Locked Features Show:**
- 🔒 Lock icon
- Grayed out appearance
- "Premium" text/badge
- "Upgrade" button on hover/click

### **Premium Users See:**
- ✨ Crown icon
- Yellow/gold highlights
- "PREMIUM" badge
- All features unlocked

---

## ✅ Summary

**Primary Purchase Entry Points:**
1. ✅ **Main Menu** - Clicking locked difficulties/variants
2. ✅ **User Profile** - "Upgrade to Premium" button
3. ✅ **Game Settings** - When trying premium difficulties

**All paths lead to the same Premium Modal** with subscription options!

---

## 🎨 UI Components

- `PremiumModal.jsx` - Main subscription modal
- `PremiumUI.jsx` - Tier cards and purchase buttons
- `UserProfile.jsx` - Profile with upgrade button
- `GameModeSelector.jsx` - Locked features trigger modal
- `GameSettings.jsx` - Settings upgrade prompts

All components use `usePremium()` hook for consistent premium status checking.

