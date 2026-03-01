import { createClient } from '@supabase/supabase-js';
import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DAILY_LIMIT_FREE = 10;

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check usage limits for free tier
    const today = new Date().toDateString();
    const resetDate = new Date(userProfile.usage_reset_date).toDateString();

    let dailyUsage = userProfile.usage_count;
    if (today !== resetDate) {
      // Reset daily counter
      dailyUsage = 0;
      await supabase
        .from('users')
        .update({ usage_reset_date: new Date().toISOString(), usage_count: 0 })
        .eq('id', user.id);
    }

    if (userProfile.plan === 'free' && dailyUsage >= DAILY_LIMIT_FREE) {
      return NextResponse.json(
        { error: 'Daily limit reached. Upgrade to Pro for unlimited drafts.' },
        { status: 429 }
      );
    }

    const { tweetText, persona = 'professional', model = 'claude' } = await request.json();

    if (!tweetText) {
      return NextResponse.json(
        { error: 'Tweet text required' },
        { status: 400 }
      );
    }

    const personaPrompts: Record<string, string> = {
      professional: 'Write a professional, thoughtful reply.',
      casual: 'Write a casual, friendly reply.',
      witty: 'Write a clever, witty reply with humor.',
      thought_leader: 'Write an insightful, educational reply that provides value.',
      supportive: 'Write a supportive, encouraging reply.',
      critical: 'Write a constructively critical reply.',
    };

    const personaDescription = personaPrompts[persona] || personaPrompts.professional;

    const systemPrompt = `You are an expert at crafting engaging social media replies on X (Twitter). 
${personaDescription}
Keep replies concise (under 280 characters when possible), engaging, and authentic.
Generate 3 alternative replies, each taking a slightly different angle.
Return only the replies, one per line.`;

    const userPrompt = `Original tweet: "${tweetText}"`;

    // Generate drafts using Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const drafts = content.text
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(0, 3); // Take first 3 drafts

    // Update usage
    if (userProfile.plan === 'free') {
      await supabase
        .from('users')
        .update({ usage_count: dailyUsage + 1 })
        .eq('id', user.id);
    }

    return NextResponse.json({
      drafts,
      usage: dailyUsage + 1,
      limit: userProfile.plan === 'free' ? DAILY_LIMIT_FREE : null,
    });
  } catch (error) {
    console.error('Draft generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate drafts' },
      { status: 500 }
    );
  }
}
