import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/export — Export draft history as CSV (Pro/Team only)
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

    // Check plan
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (!profile || profile.plan === 'free') {
      return NextResponse.json(
        { error: 'CSV export is available on Pro and Team plans. Upgrade to access this feature.' },
        { status: 403 }
      );
    }

    // Fetch all draft history
    const { data: drafts, error } = await supabase
      .from('draft_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Build CSV
    const headers = ['Date', 'Type', 'Original Tweet', 'Persona', 'Draft 1', 'Draft 2', 'Draft 3', 'Selected Draft', 'Reasoning Tags'];
    const rows = (drafts || []).map((d) => {
      const date = new Date(d.created_at).toISOString();
      const type = d.draft_type || 'reply';
      const tweet = escapeCsv(d.tweet_text || '');
      const persona = d.persona || '';
      const draft1 = escapeCsv(d.drafts?.[0] || '');
      const draft2 = escapeCsv(d.drafts?.[1] || '');
      const draft3 = escapeCsv(d.drafts?.[2] || '');
      const selected = escapeCsv(d.selected_draft || '');
      const tags = (d.reasoning_tags || []).join('; ');
      return [date, type, tweet, persona, draft1, draft2, draft3, selected, tags].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    // Track export in analytics
    await supabase.from('analytics').insert({
      user_id: user.id,
      event_type: 'export_csv',
      event_data: { rowCount: rows.length },
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="viraldraft-history-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
