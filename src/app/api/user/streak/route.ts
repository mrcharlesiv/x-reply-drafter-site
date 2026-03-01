import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { calculateStreakUpdate, toDateString } from '@/lib/streaks';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/streak - Fetch current streak data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('current_streak, longest_streak, last_active_date, streak_freeze_available, weekly_goal, plan')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get weekly draft count
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weeklyDrafts } = await supabase
      .from('draft_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString());

    // Determine streak status without modifying
    const today = new Date();
    const todayStr = toDateString(today);
    let streakStatus: 'active' | 'at_risk' | 'broken' | 'new' = 'new';

    if (profile.last_active_date) {
      if (profile.last_active_date === todayStr) {
        streakStatus = 'active';
      } else {
        const lastDate = new Date(profile.last_active_date + 'T00:00:00');
        const daysDiff = Math.floor(
          (new Date(todayStr + 'T00:00:00').getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff === 1) streakStatus = 'at_risk'; // they haven't drafted today yet
        else streakStatus = 'broken';
      }
    }

    return NextResponse.json({
      currentStreak: profile.current_streak || 0,
      longestStreak: profile.longest_streak || 0,
      lastActiveDate: profile.last_active_date,
      streakFreezeAvailable: profile.streak_freeze_available && profile.plan !== 'free',
      weeklyDrafts: weeklyDrafts || 0,
      weeklyGoal: profile.weekly_goal || 50,
      streakStatus,
    });
  } catch (error) {
    console.error('Streak fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/user/streak - Update streak (called internally when draft is created)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('current_streak, longest_streak, last_active_date, streak_freeze_available, streak_freeze_used_at, plan')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    const result = calculateStreakUpdate(
      profile.current_streak || 0,
      profile.longest_streak || 0,
      profile.last_active_date,
      profile.streak_freeze_available && profile.plan !== 'free',
      profile.streak_freeze_used_at,
      today
    );

    const updateData: Record<string, unknown> = {
      current_streak: result.newStreak,
      longest_streak: result.newLongest,
      last_active_date: toDateString(today),
    };

    if (result.streakFreezeUsed) {
      updateData.streak_freeze_used_at = toDateString(today);
      updateData.streak_freeze_available = false;
    }

    await supabase.from('users').update(updateData).eq('id', user.id);

    // Track streak event in analytics
    await supabase.from('analytics').insert({
      user_id: user.id,
      event_type: result.status === 'broken' ? 'streak_reset' : 'streak_maintained',
      event_data: {
        new_streak: result.newStreak,
        previous_streak: profile.current_streak || 0,
        freeze_used: result.streakFreezeUsed,
      },
    });

    return NextResponse.json({
      currentStreak: result.newStreak,
      longestStreak: result.newLongest,
      streakStatus: result.status,
      streakFreezeUsed: result.streakFreezeUsed,
    });
  } catch (error) {
    console.error('Streak update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/user/streak - Update weekly goal
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { weeklyGoal } = await request.json();
    if (typeof weeklyGoal !== 'number' || weeklyGoal < 1 || weeklyGoal > 500) {
      return NextResponse.json({ error: 'Invalid weekly goal (1-500)' }, { status: 400 });
    }

    await supabase
      .from('users')
      .update({ weekly_goal: weeklyGoal })
      .eq('id', user.id);

    return NextResponse.json({ weeklyGoal });
  } catch (error) {
    console.error('Goal update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
