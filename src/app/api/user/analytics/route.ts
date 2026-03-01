import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get draft history count for the week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: recentDrafts, error: draftError } = await supabase
      .from('draft_history')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false });

    if (draftError) {
      console.error('Draft history error:', draftError);
    }

    // Get saved prompts count
    const { data: savedPrompts, error: promptError } = await supabase
      .from('saved_prompts')
      .select('count(*)')
      .eq('user_id', user.id)
      .single();

    if (promptError) {
      console.error('Saved prompts error:', promptError);
    }

    // Get persona usage stats
    const { data: personaStats } = await supabase
      .from('draft_history')
      .select('persona')
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString());

    const personaMap: Record<string, number> = {};
    personaStats?.forEach((record) => {
      personaMap[record.persona] = (personaMap[record.persona] || 0) + 1;
    });

    // Get analytics events
    const { data: events } = await supabase
      .from('analytics')
      .select('event_type, created_at')
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false });

    // Get user profile for current usage
    const { data: profile } = await supabase
      .from('users')
      .select('plan, usage_count, usage_reset_date')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      usage: {
        draftsThisWeek: recentDrafts?.length || 0,
        dailyUsage: profile?.usage_count || 0,
        dailyLimit: profile?.plan === 'free' ? 10 : null,
      },
      personaStats,
      savedPromptsCount: savedPrompts ? (savedPrompts as any).count : 0,
      events: events || [],
      plan: profile?.plan,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
