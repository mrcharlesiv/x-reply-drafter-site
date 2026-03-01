# X Reply Drafter - Quick Deploy Guide

**Status:** 95% complete. Ready to launch in 30 minutes.

---

## ⚡ 3-Step Launch (Choose Your Path)

### Path A: Full Production (Recommended)
**Time: 45 minutes | Requires: 3 API keys**

#### Step 1: Get Your API Keys (10 min)

**Anthropic:**
1. Go to https://console.anthropic.com/keys
2. Create new API key
3. Copy it (format: `sk-ant-...`)

**Stripe Test Mode:**
1. Go to https://dashboard.stripe.com
2. Toggle "Test Mode" (top right)
3. Go to: Developers → API Keys
4. Copy **Publishable key** (pk_test_...)
5. Copy **Secret key** (sk_test_...)
6. Go to: Developers → Webhooks
7. Create endpoint: `https://x-reply-drafter-site.vercel.app/api/webhooks/stripe`
8. Copy **Webhook secret** (whsec_...)

#### Step 2: Deploy (20 min)

```bash
cd /Users/bots/.openclaw/workspace/x-reply-drafter-site

# 1. Update .env.local with real keys
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://soociblhjhouoexjoqge.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb2NpYmxoamhvdW9leGpvcWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTE3NDUsImV4cCI6MjA4Nzg2Nzc0NX0.JNH3sREnEiTgiUIlqHPWskTBGmGa6kC250ZJHsSE6fo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb2NpYmxoamhvdW9leGpvcWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI5MTc0NSwiZXhwIjoyMDg3ODY3NzQ1fQ.YS-bKoRBeYsUmxSFD1qOEL7xvOlpeatgOV5zXxwvbu0

ANTHROPIC_API_KEY=<PASTE_YOUR_KEY_HERE>
STRIPE_SECRET_KEY=<PASTE_YOUR_KEY_HERE>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<PASTE_YOUR_KEY_HERE>
STRIPE_WEBHOOK_SECRET=<PASTE_YOUR_KEY_HERE>

NEXT_PUBLIC_APP_URL=https://x-reply-drafter-site.vercel.app
EOF

# 2. Deploy to Vercel
npx vercel env add ANTHROPIC_API_KEY
npx vercel env add STRIPE_SECRET_KEY
npx vercel env add STRIPE_WEBHOOK_SECRET
npx vercel deploy --prod
```

#### Step 3: Supabase Schema (5 min)

1. Go to: https://supabase.com/dashboard
2. Select project: **soociblhjhouoexjoqge**
3. Click: **SQL Editor**
4. Click: **New Query**
5. Paste content of: `/Users/bots/.openclaw/workspace/x-reply-drafter-site/supabase-schema.sql`
6. Click: **Run**
7. Verify 6 tables created in **Table Editor**

#### Step 4: Stripe Products (5 min)

1. Go to: https://dashboard.stripe.com (Test Mode)
2. Click: **Products**
3. Create Product 1:
   - Name: "X Reply Drafter Pro"
   - Price: $12/month (recurring)
   - Copy the **Price ID** (price_...)
4. Create Product 2:
   - Name: "X Reply Drafter Team"
   - Price: $29/month (recurring)
   - Copy the **Price ID** (price_...)

#### Step 5: Test (5 min)

```bash
# Test signup
curl -X POST https://x-reply-drafter-site.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Should return: { "user": {...}, "token": "..." }
```

✅ **You're live!**

---

### Path B: Demo Mode (Quick Test)
**Time: 5 minutes | No real API keys needed**

If you just want to test locally without real keys:

```bash
cd /Users/bots/.openclaw/workspace/x-reply-drafter-site

# Site is already live on Vercel with test keys
# Hero animation works: https://x-reply-drafter-site.vercel.app
# Demo video: https://x-reply-drafter-site.vercel.app/demo
# Auth endpoints return errors (need real keys) but infrastructure is there
```

---

### Path C: Codex/Claude Build (Automated)
**Time: Instant | Requires: Providing keys to me**

Just give me the 3 API keys and I'll:
1. ✅ Update `.env.local`
2. ✅ Deploy Supabase schema
3. ✅ Add to Vercel env vars
4. ✅ Run production deploy
5. ✅ Test full flow
6. ✅ Confirm live

**Provide:**
```
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Then I'll execute everything in ~10 minutes.

---

## 📋 Checklist

- [ ] Landing page live on Vercel: https://x-reply-drafter-site.vercel.app
- [ ] Hero animation visible (entrance + cursor sequence)
- [ ] Demo video plays at /demo
- [ ] Anthropic API key obtained
- [ ] Stripe test account + keys obtained
- [ ] `.env.local` updated
- [ ] Vercel deployed
- [ ] Supabase schema deployed
- [ ] Signup/draft flow tested
- [ ] Chrome Web Store submission ready

---

## 🚀 Next Steps

**Choose one:**

1. **I deploy it:** Give me the 3 API keys → done in 10 min
2. **You deploy it:** Follow Path A above → done in 45 min
3. **Test mode:** Already live on Vercel (hero + demo work)

**What would you prefer?**
