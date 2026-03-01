import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_TARGETS_FREE = 5;
const MAX_TARGETS_PRO = 20;
const MAX_TARGETS_TEAM = 50;

function getMaxTargets(plan: string): number {
  switch (plan) {
    case 'team': return MAX_TARGETS_TEAM;
    case 'pro': return MAX_TARGETS_PRO;
    default: return MAX_TARGETS_FREE;
  }
}

/**
 * GET /api/user/targets — List all target accounts
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
      .select('plan')
      .eq('id', user.id)
      .single();

    const { data: targets, error } = await supabase
      .from('target_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      targets: targets || [],
      maxTargets: getMaxTargets(profile?.plan || 'free'),
    });
  } catch (error) {
    console.error('Targets fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/user/targets — Add a target account
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
      .select('plan')
      .eq('id', user.id)
      .single();

    // Check target count limit
    const { count } = await supabase
      .from('target_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const maxTargets = getMaxTargets(profile?.plan || 'free');
    if ((count || 0) >= maxTargets) {
      return NextResponse.json(
        { error: `Maximum ${maxTargets} target accounts allowed on your plan. Upgrade for more.` },
        { status: 429 }
      );
    }

    const { handle, displayName, notes, priority } = await request.json();

    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }

    // Normalize handle (remove @)
    const normalizedHandle = handle.replace(/^@/, '').trim().toLowerCase();

    if (!normalizedHandle || normalizedHandle.length > 50) {
      return NextResponse.json({ error: 'Invalid handle' }, { status: 400 });
    }

    const { data: target, error } = await supabase
      .from('target_accounts')
      .insert({
        user_id: user.id,
        handle: normalizedHandle,
        display_name: displayName || null,
        notes: notes || null,
        priority: priority || 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        return NextResponse.json({ error: 'Target account already added' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track in analytics
    await supabase.from('analytics').insert({
      user_id: user.id,
      event_type: 'target_added',
      event_data: { handle: normalizedHandle },
    });

    return NextResponse.json({ target }, { status: 201 });
  } catch (error) {
    console.error('Target add error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/user/targets — Remove a target account
 */
export async function DELETE(request: NextRequest) {
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

    const { targetId } = await request.json();
    if (!targetId) {
      return NextResponse.json({ error: 'Target ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('target_accounts')
      .delete()
      .eq('id', targetId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Target delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/user/targets — Update a target account
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

    const { targetId, displayName, notes, priority } = await request.json();
    if (!targetId) {
      return NextResponse.json({ error: 'Target ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (displayName !== undefined) updateData.display_name = displayName;
    if (notes !== undefined) updateData.notes = notes;
    if (priority !== undefined) updateData.priority = priority;

    const { data: target, error } = await supabase
      .from('target_accounts')
      .update(updateData)
      .eq('id', targetId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ target });
  } catch (error) {
    console.error('Target update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
