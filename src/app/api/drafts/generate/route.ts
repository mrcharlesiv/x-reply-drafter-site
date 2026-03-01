import { createClient } from '@supabase/supabase-js';
import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { calculateStreakUpdate, toDateString } from '@/lib/streaks';

export const dynamic = 'force-dynamic';

const DAILY_LIMIT_FREE = 10;

// Reasoning tag definitions for quality scoring (Feature 4)
const REASONING_TAGS = [
  'Hooks with question',
  'Validates then pivots',
  'Pattern interrupt',
  'Personal story',
  'Data-backed',
  'Contrarian take',
  'Curiosity gap',
] as const;

type ReasoningTag = typeof REASONING_TAGS[number];

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

    const {
      tweetText,
      persona = 'professional',
      model = 'claude',
      type = 'reply', // 'reply' | 'tweet' | 'thread' (Feature 10)
      topic,          // For tweet/thread mode
    } = await request.json();

    // Validate input based on type
    if (type === 'reply' && !tweetText) {
      return NextResponse.json({ error: 'Tweet text required for replies' }, { status: 400 });
    }
    if ((type === 'tweet' || type === 'thread') && !topic && !tweetText) {
      return NextResponse.json({ error: 'Topic or tweet text required' }, { status: 400 });
    }

    const personaPrompts: Record<string, string> = {
      professional: 'Write in a professional, thoughtful tone.',
      casual: 'Write in a casual, friendly tone.',
      witty: 'Write in a clever, witty tone with humor.',
      thought_leader: 'Write in an insightful, educational tone that provides value.',
      supportive: 'Write in a supportive, encouraging tone.',
      critical: 'Write in a constructively critical tone.',
    };

    const personaDescription = personaPrompts[persona] || personaPrompts.professional;

    // Build prompt based on type (Feature 10: Thread/Post Drafting)
    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'thread') {
      // Thread generation mode
      systemPrompt = `You are an expert at crafting engaging Twitter/X threads that go viral.
${personaDescription}
Generate 3 different thread versions, each with exactly 3 tweets.
Each thread should have a compelling hook as tweet 1, valuable content in tweet 2, and a strong call-to-action or conclusion in tweet 3.

For EACH thread version, also provide a reasoning tag explaining the strategy used.
The reasoning tag MUST be exactly one of: ${REASONING_TAGS.map(t => `"${t}"`).join(', ')}.

Return your response as valid JSON in this exact format:
{
  "drafts": [
    {
      "tweets": ["1/3 First tweet text", "2/3 Second tweet text", "3/3 Third tweet text"],
      "reasoning_tag": "one of the allowed tags"
    },
    {
      "tweets": ["1/3 First tweet text", "2/3 Second tweet text", "3/3 Third tweet text"],
      "reasoning_tag": "one of the allowed tags"
    },
    {
      "tweets": ["1/3 First tweet text", "2/3 Second tweet text", "3/3 Third tweet text"],
      "reasoning_tag": "one of the allowed tags"
    }
  ]
}

Each individual tweet must be under 280 characters. Make them engaging, authentic, and shareable.`;
      userPrompt = `Topic/idea: "${topic || tweetText}"`;
    } else if (type === 'tweet') {
      // Original tweet generation mode
      systemPrompt = `You are an expert at crafting engaging tweets on X (Twitter) that go viral.
${personaDescription}
Keep tweets concise (under 280 characters), engaging, and authentic.
Generate 3 alternative tweet options, each taking a different angle.

For EACH tweet, also provide a reasoning tag explaining the strategy used.
The reasoning tag MUST be exactly one of: ${REASONING_TAGS.map(t => `"${t}"`).join(', ')}.

Return your response as valid JSON in this exact format:
{
  "drafts": [
    { "text": "tweet text here", "reasoning_tag": "one of the allowed tags" },
    { "text": "tweet text here", "reasoning_tag": "one of the allowed tags" },
    { "text": "tweet text here", "reasoning_tag": "one of the allowed tags" }
  ]
}`;
      userPrompt = `Topic/idea: "${topic || tweetText}"`;
    } else {
      // Reply mode (default, enhanced with reasoning tags - Feature 4)
      systemPrompt = `You are an expert at crafting engaging social media replies on X (Twitter).
${personaDescription}
Keep replies concise (under 280 characters when possible), engaging, and authentic.
Generate 3 alternative replies, each taking a slightly different angle.

For EACH reply, also provide a reasoning tag explaining the strategy used.
The reasoning tag MUST be exactly one of: ${REASONING_TAGS.map(t => `"${t}"`).join(', ')}.

Return your response as valid JSON in this exact format:
{
  "drafts": [
    { "text": "reply text here", "reasoning_tag": "one of the allowed tags" },
    { "text": "reply text here", "reasoning_tag": "one of the allowed tags" },
    { "text": "reply text here", "reasoning_tag": "one of the allowed tags" }
  ]
}`;
      userPrompt = `Original tweet: "${tweetText}"`;
    }

    // Generate drafts using Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse structured JSON response (Feature 4: Quality Scoring)
    let drafts: string[];
    let reasoningTags: string[];
    let threadDrafts: Array<{ tweets: string[]; reasoning_tag: string }> | null = null;

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);

      if (type === 'thread') {
        threadDrafts = parsed.drafts.slice(0, 3).map((d: { tweets: string[]; reasoning_tag: string }) => ({
          tweets: d.tweets.slice(0, 3),
          reasoning_tag: REASONING_TAGS.includes(d.reasoning_tag as ReasoningTag)
            ? d.reasoning_tag
            : 'Hooks with question',
        }));
        drafts = threadDrafts.map(d => d.tweets.join('\n---\n'));
        reasoningTags = threadDrafts.map(d => d.reasoning_tag);
      } else {
        const parsedDrafts = parsed.drafts.slice(0, 3);
        drafts = parsedDrafts.map((d: { text: string }) => d.text);
        reasoningTags = parsedDrafts.map((d: { reasoning_tag: string }) =>
          REASONING_TAGS.includes(d.reasoning_tag as ReasoningTag)
            ? d.reasoning_tag
            : 'Hooks with question'
        );
      }
    } catch {
      // Fallback: parse as plain text (backward compatible)
      drafts = content.text
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^\d+[\.\)]\s*/, '').replace(/^["']|["']$/g, ''))
        .slice(0, 3);
      reasoningTags = drafts.map(() => 'Hooks with question');
    }

    // Update usage count
    if (userProfile.plan === 'free') {
      await supabase
        .from('users')
        .update({ usage_count: dailyUsage + 1 })
        .eq('id', user.id);
    }

    // Save to draft_history with reasoning tags and type
    await supabase.from('draft_history').insert({
      user_id: user.id,
      tweet_text: tweetText || topic || '',
      persona,
      drafts,
      reasoning_tags: reasoningTags,
      draft_type: type,
    });

    // Update streak (Feature 6)
    try {
      const streakResult = calculateStreakUpdate(
        userProfile.current_streak || 0,
        userProfile.longest_streak || 0,
        userProfile.last_active_date,
        userProfile.streak_freeze_available && userProfile.plan !== 'free',
        userProfile.streak_freeze_used_at,
        new Date()
      );

      const streakUpdate: Record<string, unknown> = {
        current_streak: streakResult.newStreak,
        longest_streak: streakResult.newLongest,
        last_active_date: toDateString(new Date()),
      };

      if (streakResult.streakFreezeUsed) {
        streakUpdate.streak_freeze_used_at = toDateString(new Date());
        streakUpdate.streak_freeze_available = false;
      }

      await supabase.from('users').update(streakUpdate).eq('id', user.id);
    } catch (streakError) {
      console.error('Streak update error (non-fatal):', streakError);
    }

    // Build response
    const response: Record<string, unknown> = {
      drafts,
      reasoningTags,
      type,
      usage: dailyUsage + 1,
      limit: userProfile.plan === 'free' ? DAILY_LIMIT_FREE : null,
    };

    if (threadDrafts) {
      response.threadDrafts = threadDrafts;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Draft generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate drafts' },
      { status: 500 }
    );
  }
}
