# X Reply Drafter - Deployment Guide

## Status: 95% Complete

Site is live at https://x-reply-drafter-site.vercel.app with:
- ✅ Landing page + hero animation
- ✅ Demo page + video
- ✅ Auth flows (signup/login)
- ✅ API endpoints (drafts, profile, analytics, Stripe)
- ⏳ Supabase database (schema ready, not deployed)
- ⏳ Stripe integration (endpoints ready, products not created)
- ⏳ Environment variables (need API keys)
- ⏳ Chrome Web Store (manifest ready, needs screenshots/submission)

---

## Phase 1: Supabase Setup (15 min)

### 1.1 Create/Access Supabase Project
- Project: `soociblhjhouoexjoqge` (shared with TimeshareMax)
- URL: https://soociblhjhouoexjoqge.supabase.co
- Get credentials from: `~/.config/notion/api_key` (contains Supabase API key)

### 1.2 Deploy Database Schema
```bash
# Option A: Via Supabase Dashboard (easiest)
1. Go to https://supabase.com/dashboard
2. Select project `soociblhjhouoexjoqge`
3. Go to SQL Editor
4. Paste entire content of `supabase-schema.sql`
5. Run query
6. Verify tables created in Tables section

# Option B: Via CLI (if configured)
supabase db push
```

### 1.3 Get Supabase Credentials
- Go to Settings → API
- Copy: **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
- Copy: **anon public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Copy: **service_role key** (SUPABASE_SERVICE_ROLE_KEY)

### 1.4 Test Connection
```bash
# Add to .env.local and test via /api/auth/register endpoint
npm run dev
# Try signup at http://localhost:3000
```

---

## Phase 2: Stripe Setup (20 min)

### 2.1 Create Stripe Account
- Go to https://dashboard.stripe.com
- Create account (or use existing)
- Switch to **Test Mode** (top-right toggle)

### 2.2 Create Products
Create 2 products in Test Mode:

**Product 1: X Reply Drafter Pro**
- Name: "X Reply Drafter Pro"
- Pricing: $12/month (recurring)
- Billing period: Monthly
- Copy Price ID → `STRIPE_PRICE_ID_PRO` (starts with `price_`)

**Product 2: X Reply Drafter Team**
- Name: "X Reply Drafter Team"
- Pricing: $29/month (recurring)
- Billing period: Monthly
- Copy Price ID → `STRIPE_PRICE_ID_TEAM` (starts with `price_`)

### 2.3 Get Stripe Keys (Test Mode)
- Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Secret key → `STRIPE_SECRET_KEY`

### 2.4 Webhook Setup
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://x-reply-drafter-site.vercel.app/api/webhooks/stripe`
- Select events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `charge.failed`
- Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

---

## Phase 3: Environment Variables (5 min)

### 3.1 Create `.env.local` (Local Dev)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://soociblhjhouoexjoqge.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon key>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key>

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_TEAM=price_...

# Anthropic (for drafts API)
ANTHROPIC_API_KEY=sk-ant-...

# Domain (production)
NEXT_PUBLIC_APP_URL=https://x-reply-drafter-site.vercel.app
```

### 3.2 Add to Vercel Environment Variables
```bash
# Go to https://vercel.com → X Reply Drafter project → Settings → Environment Variables
# Add all above variables (they'll auto-encrypt)
```

---

## Phase 4: API Testing (10 min)

### 4.1 Test Auth Flow
```bash
# 1. Local dev
npm run dev

# 2. Test signup
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Expected: { "user": {...}, "token": "..." }
```

### 4.2 Test Draft Generation
```bash
# Use token from auth response
curl -X POST http://localhost:3000/api/drafts/generate \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"persona":"professional","tweetText":"Just shipped our API"}'

# Expected: { "drafts": ["Draft 1", "Draft 2", "Draft 3"], "usage": 1 }
```

### 4.3 Test Stripe Checkout
```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_..."}'

# Expected: { "sessionId": "cs_test_..." }
```

---

## Phase 5: Chrome Web Store Submission (30 min)

### 5.1 Prepare Extension Package
```bash
cd /Users/bots/.openclaw/workspace/x-reply-drafter/

# Update manifest.json
# - Set version to "1.0.0"
# - Ensure all URLs point to production (https://x-reply-drafter-site.vercel.app)

# Create zip for submission
zip -r x-reply-drafter-v1.0.0.zip . \
  -x "node_modules/*" ".git/*" ".env*" "*.md"

# File size should be < 100MB
```

### 5.2 Create Chrome Web Store Account
- Go to https://chrome.google.com/webstore/devconsole
- Pay $5 one-time developer fee
- Verify email

### 5.3 Create Store Listing
**Title:** X Reply Drafter  
**Short Description (132 chars):** Draft viral replies on X in seconds. AI-powered suggestions that match your voice.

**Full Description:**
```
Stop staring at a blank reply box on X (formerly Twitter).

X Reply Drafter uses AI to generate witty, engaging replies in seconds. No API key needed. No monthly fees. Just install the extension and start drafting better replies.

✨ Features:
- Generate 3 reply options instantly
- AI learns your voice over time
- Fully private - data never leaves your machine
- Free forever (premium features coming soon)
- Works on x.com

💡 How It Works:
1. Click the "Draft Reply" button on any tweet
2. Our AI generates 3 contextual reply options
3. Pick your favorite and post!

📊 Privacy:
Your tweets and replies are never stored. Everything is processed locally on your device.

🚀 Perfect for:
- Growing your X presence
- Saving time on daily engagement
- Finding the right tone for replies
- Breaking writer's block

Install now and start crafting better replies!
```

**Category:** Productivity  
**Languages:** English  
**Content Rating:** Everyone

### 5.4 Upload Screenshots (1280x800px)
Create 4 screenshots showing:
1. **Hero:** "Draft viral replies on X in seconds"
2. **Feature 1:** Browser with "Draft Reply" button highlighted
3. **Feature 2:** Three reply options generated
4. **Feature 3:** User selecting and posting reply

### 5.5 Provide Icons
- Small (128x128): `/x-reply-drafter/icons/icon-128.png`
- Large (1400x560): Create banner image for store

### 5.6 Submit to Review
- Upload all assets
- Submit for review (takes 24-72 hours)
- Monitor review status in devconsole

---

## Phase 6: Post-Launch (Production)

### 6.1 Monitor Analytics
- Check `/dashboard` → Analytics on live site
- Monitor Stripe dashboard for charges
- Track Supabase usage

### 6.2 Update Extension Link
- Once Chrome Web Store listing is live
- Update "Add to Chrome" button → link to Chrome store URL

### 6.3 Track Metrics
- Active users (Supabase)
- Daily draft requests
- Conversion rate (Free → Pro)
- Chrome rating

---

## Credentials Reference

| Service | Location | What to Copy |
|---------|----------|--------------|
| Supabase | supabase.com/dashboard | URL + anon key + service role key |
| Stripe | dashboard.stripe.com (Test) | Publishable key + Secret key + Price IDs |
| Anthropic | console.anthropic.com | API key for drafts |
| Chrome Dev | chrome.google.com/webstore/devconsole | Developer ID |

---

## Troubleshooting

### "Supabase connection failed"
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify anon key in `.env.local`
- Test via `curl` to Supabase API

### "Stripe webhook not firing"
- Ensure webhook secret in `.env.local` is from Test Mode
- Check webhook endpoint in Stripe dashboard is correct
- Use `stripe listen` CLI to test locally

### "Chrome Web Store rejection"
- Common issues:
  - Extension requests excessive permissions (check manifest)
  - Privacy policy missing or unclear
  - Screenshots don't match functionality
- Re-read rejection email for specific reason
- Fix and resubmit

---

## Timeline Estimate
- Supabase setup: 15 min
- Stripe setup: 20 min
- Env vars + testing: 15 min
- Chrome Web Store prep: 30 min
- **Total: ~80 minutes** (1.5 hours)

Once all credentials are in `.env.local` and Vercel:
- **Site goes live fully functional**
- **Chrome extension ready for users**
- **Monetization active**

Good luck! 🚀
