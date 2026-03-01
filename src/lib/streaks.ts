/**
 * Streak calculation utilities
 * Feature 6: Usage Streaks + Gamification
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakFreezeAvailable: boolean;
  weeklyDrafts: number;
  weeklyGoal: number;
  streakStatus: 'active' | 'at_risk' | 'broken' | 'new';
}

/**
 * Calculate streak status based on last active date
 * - Same day: streak is active, no change needed
 * - Yesterday: streak continues, increment
 * - 2+ days ago: streak broken (unless freeze available)
 * - No last active: new user
 */
export function calculateStreakUpdate(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string | null,
  streakFreezeAvailable: boolean,
  streakFreezeUsedAt: string | null,
  today: Date = new Date()
): {
  newStreak: number;
  newLongest: number;
  streakFreezeUsed: boolean;
  status: StreakData['streakStatus'];
} {
  const todayStr = toDateString(today);

  // No previous activity — first ever draft
  if (!lastActiveDate) {
    return {
      newStreak: 1,
      newLongest: Math.max(longestStreak, 1),
      streakFreezeUsed: false,
      status: 'active',
    };
  }

  // Already active today — no change
  if (lastActiveDate === todayStr) {
    return {
      newStreak: currentStreak,
      newLongest: longestStreak,
      streakFreezeUsed: false,
      status: 'active',
    };
  }

  const lastDate = new Date(lastActiveDate + 'T00:00:00');
  const todayDate = new Date(todayStr + 'T00:00:00');
  const daysDiff = Math.floor(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Yesterday — streak continues
  if (daysDiff === 1) {
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      newLongest: Math.max(longestStreak, newStreak),
      streakFreezeUsed: false,
      status: 'active',
    };
  }

  // 2 days ago — check for streak freeze
  if (daysDiff === 2 && streakFreezeAvailable) {
    // Check if freeze wasn't already used this month (compare YYYY-MM strings to avoid TZ issues)
    const todayMonth = todayStr.substring(0, 7);
    const freezeUsedThisMonth =
      streakFreezeUsedAt && streakFreezeUsedAt.substring(0, 7) === todayMonth;

    if (!freezeUsedThisMonth) {
      const newStreak = currentStreak + 1;
      return {
        newStreak,
        newLongest: Math.max(longestStreak, newStreak),
        streakFreezeUsed: true,
        status: 'active',
      };
    }
  }

  // Streak broken — start fresh
  return {
    newStreak: 1,
    newLongest: longestStreak,
    streakFreezeUsed: false,
    status: 'broken',
  };
}

/**
 * Get streak display info (emoji + message)
 */
export function getStreakDisplay(streak: number): { emoji: string; message: string } {
  if (streak === 0) return { emoji: '💤', message: 'Start your streak today!' };
  if (streak === 1) return { emoji: '🔥', message: 'Day 1 — keep it going!' };
  if (streak < 7) return { emoji: '🔥', message: `${streak}-day streak!` };
  if (streak < 14) return { emoji: '🔥🔥', message: `${streak}-day streak! On fire!` };
  if (streak < 30) return { emoji: '🔥🔥🔥', message: `${streak}-day streak! Unstoppable!` };
  if (streak < 100) return { emoji: '💎', message: `${streak}-day streak! Diamond hands!` };
  return { emoji: '🏆', message: `${streak}-day streak! LEGENDARY!` };
}

/**
 * Convert Date to YYYY-MM-DD string in local time
 */
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
