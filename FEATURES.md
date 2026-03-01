# ViralDraft — Feature Build (March 2026)

Branch: `features/approved-build-mar-2026`

## Features Built

### Feature 6: Usage Streaks + Gamification ✅
**Files:**
- `migrations/001_streaks.sql` — Database schema (streak columns on users table)
- `src/lib/streaks.ts` — Streak calculation utilities
- `src/app/api/user/streak/route.ts` — GET/POST/PATCH endpoints
- `src/components/dashboard/streak-display.tsx` — Streak UI component (compact + full)
- `src/__tests__/streaks.test.ts` — 16 unit tests (all passing)

**What it does:**
- Tracks consecutive daily usage (drafts created)
- Calculates current streak, longest streak, streak status
- Pro users get 1 streak freeze/month (miss 1 day without losing streak)
- Streak automatically updates when drafts are generated
- UI shows streak with emoji tiers (🔥 → 🔥🔥 → 🔥🔥🔥 → 💎 → 🏆)
- Weekly goal progress bar (user-configurable, default 50/week)
- Milestone celebrations (7, 14, 30, 50, 100 days)
- "At risk" warning if user hasn't drafted today

---

### Feature 4: Reply Quality Scoring + "Why This Works" Context ✅
**Files:**
- `migrations/002_quality_scoring.sql` — Add reasoning_tags and draft_type columns
- `src/components/reasoning-tag.tsx` — Reasoning tag badge with tooltip
- Updated `src/app/api/drafts/generate/route.ts` — Structured JSON prompts with reasoning

**What it does:**
- AI returns structured JSON with each draft + reasoning tag
- 7 strategy tags: "Hooks with question", "Validates then pivots", "Pattern interrupt", "Personal story", "Data-backed", "Contrarian take", "Curiosity gap"
- Each tag has unique icon, color, and tooltip description
- Tags stored in `draft_history.reasoning_tags` for analytics
- Dashboard shows top strategies used (tag breakdown)
- Fallback parsing if JSON extraction fails (backward compatible)

---

### Feature 1: Onboarding Flow + "First Draft in 60 Seconds" ✅
**Files:**
- `src/components/onboarding/onboarding-flow.tsx` — 5-step guided onboarding
- `src/app/api/user/analytics/track/route.ts` — Generic event tracking endpoint

**What it does:**
- 5-step modal overlay (Welcome → Find Tweet → Generate → Pick → Celebrate)
- Triggers on first visit after signup (localStorage flag)
- Non-blocking, dismissible, smooth animations
- Progress bar + step indicators
- Tracks completion/dismissal in analytics
- Final step offers persona customization
- Works in compact mode for extension popup
- Exports `useOnboarding()` hook for easy integration

---

### Feature 10: Thread/Post Drafting (Beyond Replies) ✅
**Files:**
- `src/components/mode-selector.tsx` — Reply/Tweet/Thread mode toggle
- `src/components/thread-draft-card.tsx` — Thread display with tweet numbering
- `src/components/draft-card.tsx` — Single draft card with reasoning tag
- Updated `src/app/api/drafts/generate/route.ts` — Multi-type generation

**What it does:**
- Three modes: Reply (default), Tweet (original posts), Thread (3-tweet threads)
- Different AI prompts optimized for each content type
- Thread mode generates 3 alternative threads, each with 3 tweets
- Thread UI shows numbered tweets with visual connector lines
- Mode selector component with icons
- Draft type stored in `draft_history.draft_type` for analytics
- Dashboard shows content type breakdown chart

---

### Feature 5: Smart Target Suggestions — "Reply to These People" ✅
**Files:**
- `migrations/003_target_accounts.sql` — Target accounts table with RLS
- `src/app/api/user/targets/route.ts` — Full CRUD (GET/POST/PATCH/DELETE)
- `src/components/dashboard/target-accounts.tsx` — Management UI

**What it does:**
- Users add X handles they want to consistently reply to
- Plan-based limits: Free (5), Pro (20), Team (50)
- Priority starring (sort high-value targets to top)
- Notes field for context ("Why this account?")
- Direct link to X profile
- Duplicate prevention (unique constraint on user_id + handle)
- Handle normalization (strips @, lowercases)
- Analytics tracking for target additions

---

### Feature 11: Analytics Dashboard (Web App) ✅
**Files:**
- `src/app/api/user/stats/route.ts` — Comprehensive stats endpoint
- `src/app/api/user/export/route.ts` — CSV export (Pro/Team only)
- `src/components/dashboard/activity-heatmap.tsx` — 90-day activity heatmap
- Updated `src/app/dashboard/page.tsx` — Full dashboard rebuild

**What it does:**
- 5 key metric cards (Total Drafts, This Week, This Month, Daily Usage, Target Accounts)
- 90-day activity heatmap (GitHub-style contribution graph)
- Weekly trend bar chart (4-week comparison)
- Persona performance comparison (usage bars)
- Content type breakdown (reply vs tweet vs thread)
- Top reasoning strategies used
- Target accounts management panel
- Streak display (compact badge + full widget)
- CSV export button (Pro/Team only, up to 5000 records)
- Responsive layout (mobile-friendly)
- Onboarding overlay integration

---

## Database Migrations

Run these in order via Supabase SQL editor:
1. `migrations/001_streaks.sql` — Streak columns on users
2. `migrations/002_quality_scoring.sql` — Reasoning tags + draft type on draft_history
3. `migrations/003_target_accounts.sql` — Target accounts table

---

## API Endpoints Added

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/streak` | Get streak data |
| POST | `/api/user/streak` | Update streak (called on draft creation) |
| PATCH | `/api/user/streak` | Update weekly goal |
| GET | `/api/user/stats` | Comprehensive dashboard stats |
| GET | `/api/user/export` | CSV export (Pro/Team) |
| POST | `/api/user/analytics/track` | Track analytics events |
| GET | `/api/user/targets` | List target accounts |
| POST | `/api/user/targets` | Add target account |
| PATCH | `/api/user/targets` | Update target account |
| DELETE | `/api/user/targets` | Remove target account |

---

## Components Added

| Component | Location | Description |
|-----------|----------|-------------|
| `StreakDisplay` | `components/dashboard/streak-display.tsx` | Streak counter (compact + full) |
| `ActivityHeatmap` | `components/dashboard/activity-heatmap.tsx` | 90-day contribution graph |
| `TargetAccounts` | `components/dashboard/target-accounts.tsx` | Target accounts management |
| `OnboardingFlow` | `components/onboarding/onboarding-flow.tsx` | 5-step guided onboarding |
| `ReasoningTag` | `components/reasoning-tag.tsx` | Strategy tag badge + tooltip |
| `ModeSelector` | `components/mode-selector.tsx` | Reply/Tweet/Thread toggle |
| `DraftCard` | `components/draft-card.tsx` | Single draft with reasoning |
| `ThreadDraftCard` | `components/thread-draft-card.tsx` | Thread draft display |

---

## Tests

Run: `npx jest`

- 16 tests in `src/__tests__/streaks.test.ts` (all passing)
- Covers: streak calculation, streak freeze, streak display, date formatting
