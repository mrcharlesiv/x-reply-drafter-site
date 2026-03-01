# Vercel Deployment Configuration

## Important: GitHub Auto-Deploy Integration

The Vercel project **must have auto-deploy enabled** for commits to `main` to automatically deploy to production.

### ✅ How to Verify Auto-Deploy is Working

1. Go to https://vercel.com/dashboard
2. Click on `x-reply-drafter-site` project
3. Go to **Settings → Git**
4. Confirm:
   - ✅ GitHub repository is connected: `mrcharlesiv/x-reply-drafter-site`
   - ✅ Production branch is set to: `main`
   - ✅ "Deploy on Push" is **ENABLED**

### ⚠️ What Happens if Auto-Deploy is Off

- Commits push to GitHub successfully
- **But Vercel does NOT deploy them automatically**
- Users see old code until you manually run `vercel --prod`
- This happened on 2026-03-01 (9+ commits deployed ~6 hours later)

### 🔧 Manual Deployment (if needed)

If auto-deploy is broken or you need an immediate redeploy:

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# From the project root, deploy to production
vercel --prod
```

Takes ~2-3 minutes. You'll see the deployment progress in the CLI.

### 🧪 Test Auto-Deploy

To verify auto-deploy is working:

```bash
git commit --allow-empty -m "test: verify vercel auto-deploy"
git push origin main
```

Then check https://vercel.com/dashboard → `x-reply-drafter-site` → **Deployments** tab. A new deployment should appear within 30 seconds.

### 📝 History

- **2026-03-01 06:00 CST:** Auto-deploy not working, 9+ commits queued
- **2026-03-01 06:34 CST:** Subagent manually ran `vercel --prod` to deploy latest code
- **Fix:** Check Vercel dashboard settings and ensure GitHub integration is active

---

**TL;DR:** If you push to `main` and changes don't appear on the live site within 3 minutes, check Vercel dashboard Settings → Git to verify auto-deploy is enabled.
