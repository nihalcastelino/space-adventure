# 📋 Stripe Subscription Events Reference

Based on [Stripe's official documentation](https://docs.stripe.com/billing/subscriptions/webhooks), here are the key events for managing subscriptions.

---

## 🎯 Core Events (Required)

### 1. `checkout.session.completed`
**When:** User completes checkout
**Action:** 
- For **lifetime** purchases: Activate premium immediately
- For **subscriptions**: Store subscription ID, wait for `invoice.paid`

### 2. `customer.subscription.created`
**When:** Subscription is created
**Action:** Store subscription ID and metadata

### 3. `customer.subscription.updated`
**When:** Subscription changes (renewal, plan change, coupon applied, etc.)
**Action:** Update subscription status and expiration date

### 4. `customer.subscription.deleted`
**When:** Subscription is cancelled
**Action:** Revoke premium access, set tier to 'free'

### 5. `invoice.paid` ⭐ **MOST IMPORTANT**
**When:** Invoice is successfully paid
**Action:** **Activate premium access** - This is when you provision access!

### 6. `invoice.payment_failed`
**When:** Payment fails
**Action:** 
- Check subscription status
- If `past_due` or `unpaid`: Revoke access
- Notify customer to update payment method

---

## 🔔 Recommended Events (Better UX)

### 7. `invoice.payment_action_required`
**When:** Customer needs to authenticate payment (3D Secure, etc.)
**Action:** Notify customer, keep access active for now

### 8. `customer.subscription.trial_will_end`
**When:** 3 days before trial ends
**Action:** Send reminder email, verify payment method exists

### 9. `invoice.upcoming`
**When:** Few days before renewal
**Action:** Can add extra invoice items if needed

### 10. `customer.created`
**When:** Customer is created
**Action:** Store customer ID

---

## ⚠️ Important Subscription Statuses

| Status | Description | Action |
|--------|-------------|--------|
| `active` | Subscription in good standing | ✅ Grant premium access |
| `trialing` | In trial period | ✅ Grant premium access |
| `past_due` | Payment failed | ⚠️ Revoke access, notify customer |
| `unpaid` | Payment failed, retries exhausted | ❌ Revoke access |
| `canceled` | Subscription cancelled | ❌ Revoke access |
| `incomplete` | Initial payment pending | ⏳ Wait for payment |
| `incomplete_expired` | Initial payment failed | ❌ Revoke access |
| `paused` | Trial ended without payment method | ⏸️ Pause access |

---

## 🔄 Subscription Lifecycle Flow

```
1. User clicks "Subscribe"
   ↓
2. checkout.session.completed
   → Store subscription ID
   ↓
3. customer.subscription.created
   → Subscription created (status: incomplete)
   ↓
4. invoice.paid ⭐
   → ACTIVATE PREMIUM ACCESS
   → Status: active
   ↓
5. (Monthly renewal)
   ↓
6. invoice.upcoming (3 days before)
   → Optional: Add invoice items
   ↓
7. invoice.paid
   → EXTEND PREMIUM ACCESS
   → Update expiration date
   ↓
8. (If payment fails)
   ↓
9. invoice.payment_failed
   → Check subscription status
   → If past_due: Revoke access
   → Notify customer
```

---

## 💡 Key Insights from Stripe Docs

### 1. **Don't Activate on `checkout.session.completed`**
- For subscriptions, wait for `invoice.paid`
- Only activate immediately for one-time payments (lifetime)

### 2. **Track Expiration Dates**
- Store `current_period_end` from subscription
- Check on login if subscription is still active
- Add 1-2 days buffer for payment processing

### 3. **Handle Payment Failures Gracefully**
- Don't revoke immediately on first failure
- Stripe retries automatically (Smart Retries)
- Only revoke when status is `past_due`, `unpaid`, or `canceled`

### 4. **Invoice Finalization**
- Stripe waits up to 72 hours for webhook response
- If webhook fails, invoice finalization is delayed
- Make sure your webhook responds quickly (< 5 seconds)

---

## 🧪 Testing Events

### Using Stripe CLI:
```bash
# Test checkout completion
stripe trigger checkout.session.completed

# Test subscription creation
stripe trigger customer.subscription.created

# Test invoice payment
stripe trigger invoice.paid

# Test payment failure
stripe trigger invoice.payment_failed
```

### Using Test Cards:
- **Success:** `4242 4242 4242 4242`
- **Requires Auth:** `4000 0025 0000 3155`
- **Declined:** `4000 0000 0000 0002`

---

## 📝 Implementation Checklist

- [ ] Handle `checkout.session.completed` (lifetime only)
- [ ] Handle `customer.subscription.created` (store subscription ID)
- [ ] Handle `invoice.paid` (activate premium) ⭐
- [ ] Handle `customer.subscription.updated` (renewals)
- [ ] Handle `customer.subscription.deleted` (revoke access)
- [ ] Handle `invoice.payment_failed` (check status, revoke if needed)
- [ ] Store expiration dates from `current_period_end`
- [ ] Check subscription status on user login
- [ ] Add 1-2 day buffer for payment processing delays

---

**Reference:** [Stripe Subscription Webhooks Documentation](https://docs.stripe.com/billing/subscriptions/webhooks)

