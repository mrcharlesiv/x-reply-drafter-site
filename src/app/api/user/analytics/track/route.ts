import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const VALID_EVENT_TYPES = [
  'onboarding_completed',
  'onboarding_dismissed',
  'draft_selected',
  'draft_posted',
  'streak_maintained',
  'streak_reset',
  'target_added',
  'target_removed',
  'persona_created',
  'mode_switched',
  'thread_created',
  'dashboard_viewed',
  'export_csv',
  'goal_updated',
] as const;

/**
 * POST /api/user/analytics/track — Track a user analytics event
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

    const { eventType, eventData } = await request.json();

    if (!eventType || typeof eventType !== 'string') {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    // Insert analytics event
    const { error } = await supabase.from('analytics').insert({
      user_id: user.id,
      event_type: eventType,
      event_data: eventData || {},
    });

    if (error) {
      console.error('Analytics track error:', error);
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
