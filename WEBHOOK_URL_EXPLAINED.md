# 🔗 Webhook URL Explained

## What is a Webhook URL?

A webhook URL is **your website's endpoint** where Stripe sends notifications about payment events (like when someone pays, cancels, etc.).

---

## 🏠 Your Webhook URL Format

Since you're using **Netlify**, your webhook URL will be:

### Production (After Deployment):
```
https://your-site-name.netlify.app/.netlify/functions/webhook
```

**Or if you have a custom domain:**
```
https://yourdomain.com/.netlify/functions/webhook
```

### Local Development (Don't Use Dashboard):
**Don't add a webhook in Stripe Dashboard for local testing!**

Instead, use **Stripe CLI**:
```bash
stripe listen --forward-to localhost:8888/.netlify/functions/webhook
```

---

## 📍 How to Find Your Netlify URL

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Select your site**
3. **Look at the site overview** - you'll see:
   - **Site URL**: `https://your-site-name.netlify.app`
   - Or your custom domain if configured

4. **Your webhook URL is:**
   ```
   https://your-site-name.netlify.app/.netlify/functions/webhook
   ```

---

## 🔄 Two Different Approaches

### Option 1: Local Development (Recommended)

**Use Stripe CLI** - No webhook needed in Dashboard:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:8888/.netlify/functions/webhook
```

**Benefits:**
- ✅ Works immediately
- ✅ No need to deploy first
- ✅ Easy testing
- ✅ Stripe CLI gives you a webhook secret automatically

**The CLI will output:**
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**Add this to `.env`:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

### Option 2: Production (After Deployment)

**Add webhook in Stripe Dashboard:**

1. **Deploy your site to Netlify first**
2. **Get your Netlify URL** (e.g., `https://space-adventure.netlify.app`)
3. **Go to Stripe Dashboard** → Developers → Event destinations
4. **Add endpoint URL:**
   ```
   https://space-adventure.netlify.app/.netlify/functions/webhook
   ```
5. **Select events** (see STRIPE_WEBHOOK_SETUP.md)
6. **Copy webhook secret** → Add to Netlify environment variables

---

## 🎯 Step-by-Step: Setting Up Production Webhook

### Step 1: Deploy to Netlify
```bash
# Build your site
npm run build

# Deploy (or connect GitHub for auto-deploy)
netlify deploy --prod
```

### Step 2: Get Your Netlify URL
- Go to Netlify Dashboard
- Copy your site URL (e.g., `https://space-adventure.netlify.app`)

### Step 3: Add Webhook in Stripe Dashboard
1. Go to Stripe Dashboard → Developers → **Event destinations**
2. Click **"+ Add destination"**
3. Select **"Webhook endpoint"**
4. **Endpoint URL:**
   ```
   https://your-site-name.netlify.app/.netlify/functions/webhook
   ```
5. **Description:** `Space Adventure - Production webhooks`
6. Click **"Add destination"**

### Step 4: Select Events
Select these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`

### Step 5: Get Webhook Secret
1. Click on your webhook endpoint
2. Find **"Signing secret"** section
3. Click **"Reveal"**
4. Copy the secret (`whsec_...`)

### Step 6: Add to Netlify Environment Variables
1. Go to Netlify Dashboard → Site settings → **Environment variables**
2. Add:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxxxx` (the secret you copied)
3. **Redeploy** your site (or it will auto-redeploy)

---

## 🧪 Testing Your Webhook

### Test Locally (Before Deploying):
```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:8888/.netlify/functions/webhook

# Terminal 3: Trigger a test event
stripe trigger checkout.session.completed
```

### Test Production:
1. Make a test purchase on your live site
2. Check Stripe Dashboard → Developers → **Event destinations** → Your endpoint
3. Click on your endpoint → View **"Recent events"**
4. You should see events being received

---

## ❓ Common Questions

### Q: Do I need to add webhook in Dashboard for local testing?
**A:** No! Use Stripe CLI instead. Only add webhook in Dashboard for production.

### Q: What if I don't have a custom domain?
**A:** Use your Netlify default URL: `https://your-site-name.netlify.app/.netlify/functions/webhook`

### Q: Can I use the same webhook for test and live mode?
**A:** No, you need separate webhooks:
- **Test mode webhook:** Use Stripe CLI locally
- **Live mode webhook:** Add in Dashboard after deploying

### Q: What if my webhook URL changes?
**A:** Update it in Stripe Dashboard → Event destinations → Edit endpoint

---

## 📋 Quick Checklist

**For Local Development:**
- [ ] Install Stripe CLI
- [ ] Run `stripe listen --forward-to localhost:8888/.netlify/functions/webhook`
- [ ] Copy webhook secret to `.env`
- [ ] Test with `stripe trigger` commands

**For Production:**
- [ ] Deploy site to Netlify
- [ ] Get Netlify URL
- [ ] Add webhook endpoint in Stripe Dashboard
- [ ] Select required events
- [ ] Copy webhook secret
- [ ] Add secret to Netlify environment variables
- [ ] Redeploy site

---

**Summary:** 
- **Local:** Use Stripe CLI (no Dashboard webhook needed)
- **Production:** `https://your-site.netlify.app/.netlify/functions/webhook`

