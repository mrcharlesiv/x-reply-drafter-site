import { NextRequest, NextResponse } from 'next/server';
import { generateSmartReplies } from '@/lib/smart-reply-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tweetText, author = 'unknown' } = body;

    if (!tweetText) {
      return NextResponse.json(
        { error: 'Missing tweetText' },
        { status: 400 }
      );
    }

    // Step 1: Use smart reply engine to classify and build context-aware prompts
    const smartPrompts = generateSmartReplies(tweetText, author);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    // Step 2: Call Claude with context-aware system prompt
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 512,
        system: smartPrompts.systemPrompt,
        messages: [
          {
            role: 'user',
            content: smartPrompts.userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', response.status, error);
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text || '';

    // Step 3: Parse drafts (can be JSON array or plain text)
    let drafts: Array<{ text: string }> = [];
    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        drafts = parsed.filter(d => typeof d === 'object' && d.text);
      } else if (parsed && parsed.text) {
        drafts = [parsed];
      }
    } catch {
      if (responseText.trim()) {
        drafts = [{ text: responseText.trim() }];
      }
    }

    if (!drafts.length) {
      return NextResponse.json(
        { error: 'No draft generated' },
        { status: 500 }
      );
    }

    // Step 4: Score and filter — return only high-quality drafts
    const scored = smartPrompts.scoreAndFilter(drafts);

    if (!scored.length) {
      return NextResponse.json(
        { error: 'All drafts failed quality checks', tweetType: smartPrompts.tweetType },
        { status: 500 }
      );
    }

    // Return the top-scoring draft with metadata
    const bestDraft = scored[0];

    return NextResponse.json({
      ok: true,
      draft: bestDraft.text,
      tweetType: smartPrompts.tweetType,
      strategies: smartPrompts.strategies.primary,
      score: bestDraft.score,
      issues: bestDraft.issues,
      note: `Score: ${bestDraft.score}/100. Tweet type: ${smartPrompts.tweetType}. ${bestDraft.issues.length ? 'Issues: ' + bestDraft.issues.join(', ') : 'No issues detected'}`,
    });
  } catch (error) {
    console.error('Draft generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate draft: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
