import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/stats — Comprehensive user statistics for the dashboard
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

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Total drafts all-time
    const { count: totalDrafts } = await supabase
      .from('draft_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Drafts this week
    const { count: weeklyDrafts } = await supabase
      .from('draft_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString());

    // Drafts this month
    const { count: monthlyDrafts } = await supabase
      .from('draft_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthAgo.toISOString());

    // Daily activity for the past 90 days (heatmap data)
    const { data: dailyActivity } = await supabase
      .from('draft_history')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Aggregate daily counts
    const heatmapData: Record<string, number> = {};
    dailyActivity?.forEach((record) => {
      const date = new Date(record.created_at).toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    // Persona usage stats (past 30 days)
    const { data: personaData } = await supabase
      .from('draft_history')
      .select('persona')
      .eq('user_id', user.id)
      .gte('created_at', monthAgo.toISOString());

    const personaStats: Record<string, number> = {};
    personaData?.forEach((record) => {
      personaStats[record.persona] = (personaStats[record.persona] || 0) + 1;
    });

    // Draft type breakdown (past 30 days)
    const { data: typeData } = await supabase
      .from('draft_history')
      .select('draft_type')
      .eq('user_id', user.id)
      .gte('created_at', monthAgo.toISOString());

    const typeStats: Record<string, number> = {};
    typeData?.forEach((record) => {
      const t = record.draft_type || 'reply';
      typeStats[t] = (typeStats[t] || 0) + 1;
    });

    // Reasoning tag stats (past 30 days)
    const { data: tagData } = await supabase
      .from('draft_history')
      .select('reasoning_tags')
      .eq('user_id', user.id)
      .gte('created_at', monthAgo.toISOString());

    const tagStats: Record<string, number> = {};
    tagData?.forEach((record) => {
      if (record.reasoning_tags) {
        record.reasoning_tags.forEach((tag: string) => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
      }
    });

    // Weekly trend (past 4 weeks)
    const weeklyTrend: Array<{ week: string; count: number }> = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const { count } = await supabase
        .from('draft_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      weeklyTrend.push({
        week: `Week ${4 - i}`,
        count: count || 0,
      });
    }

    // Saved prompts count
    const { count: savedPromptsCount } = await supabase
      .from('saved_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Target accounts count
    const { count: targetAccountsCount } = await supabase
      .from('target_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile.name,
        plan: profile.plan,
      },
      overview: {
        totalDrafts: totalDrafts || 0,
        weeklyDrafts: weeklyDrafts || 0,
        monthlyDrafts: monthlyDrafts || 0,
        savedPrompts: savedPromptsCount || 0,
        targetAccounts: targetAccountsCount || 0,
      },
      streak: {
        current: profile.current_streak || 0,
        longest: profile.longest_streak || 0,
        lastActiveDate: profile.last_active_date,
        weeklyGoal: profile.weekly_goal || 50,
      },
      usage: {
        dailyUsage: profile.usage_count || 0,
        dailyLimit: profile.plan === 'free' ? 10 : null,
      },
      heatmapData,
      personaStats,
      typeStats,
      tagStats,
      weeklyTrend,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
