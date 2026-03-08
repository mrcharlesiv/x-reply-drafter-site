/**
 * Smart Reply Engine (TypeScript)
 * 
 * Context-aware reply generation that:
 * 1. Classifies the parent tweet type
 * 2. Selects optimal strategy based on 1,150-pair analysis
 * 3. Scores replies against anti-patterns
 * 
 * Ported from reply-guy-research/scripts/smart-reply-engine.mjs
 */

export type TweetType = 'question' | 'statement' | 'hot-take' | 'personal-story' | 'announcement' | 'meme' | 'list-thread';
export type Strategy = 'question' | 'yes-and' | 'humor' | 'quick-react' | 'personal-story' | 'contrarian' | 'framework' | 'balanced-correction';

export interface StrategyConfig {
  primary: Strategy[];
  avoid: Strategy[];
  note: string;
  lengthHint: 'short-or-substantive' | 'any-bimodal' | 'short-preferred' | 'short-or-medium' | 'ultra-short';
}

export interface ScoreResult {
  score: number;
  issues: string[];
}

export interface PromptPackage {
  tweetType: TweetType;
  strategies: StrategyConfig;
  systemPrompt: string;
  userPrompt: string;
  scoreAndFilter: (drafts: { text: string; strategy?: string }[]) => Array<{ text: string; strategy?: string; score: number; issues: string[]; chars: number }>;
}

// ─── Tweet Classification ────────────────────────────────────────────────────

export function classifyTweet(text: string): TweetType {
  const lower = text.toLowerCase().trim();
  
  // Question detection
  const questionMarks = (text.match(/\?/g) || []).length;
  const startsWithQuestion = /^(what|how|why|when|where|who|which|is|are|do|does|can|could|would|should|have|has|will)/i.test(lower);
  if (questionMarks >= 1 && (startsWithQuestion || text.trim().endsWith('?'))) {
    return 'question';
  }
  
  // Meme/joke detection
  if (/😂|💀|🤣|😅|lmao|lol|shitpost|meme/i.test(text) || (text.length < 30 && /[😂💀🤣🫠😭]/.test(text))) {
    return 'meme';
  }
  
  // Personal story detection
  if (/\b(i (just|recently|finally)|my (wife|husband|kid|son|daughter|dog|mom|dad)|yesterday|last (week|night|month)|true story|confession)/i.test(text)) {
    return 'personal-story';
  }
  
  // Announcement detection
  if (/\b(announcing|launched|launching|releasing|just shipped|introducing|we're (excited|thrilled)|breaking|new feature|now available|just dropped)\b/i.test(text) ||
      /🚀|🎉|📢/.test(text)) {
    return 'announcement';
  }
  
  // Hot take / opinion
  if (/\b(unpopular opinion|hot take|controversial|hear me out|i think|the truth is|nobody talks about|everyone is wrong)\b/i.test(text) ||
      (text.length < 200 && /\b(is (dead|dying|overrated|underrated|broken|the future))\b/i.test(text))) {
    return 'hot-take';
  }
  
  // List/thread
  if (/\b(1\.|1\)|1\/|step 1|rule 1|thread|🧵)\b/i.test(text) || (text.match(/\d+[\.\)\/]/g) || []).length >= 3) {
    return 'list-thread';
  }
  
  // Default: statement
  return 'statement';
}

// ─── Strategy Selection ──────────────────────────────────────────────────────

const STRATEGY_MAP: Record<TweetType, StrategyConfig> = {
  'question': {
    primary: ['personal-story', 'yes-and', 'humor'],
    avoid: ['question', 'framework'],
    note: 'Answer the question directly. Do NOT ask another question back.',
    lengthHint: 'short-or-substantive',
  },
  'statement': {
    primary: ['question', 'yes-and', 'balanced-correction'],
    avoid: ['framework', 'contrarian'],
    note: 'Add a new angle the author did not consider.',
    lengthHint: 'any-bimodal',
  },
  'hot-take': {
    primary: ['balanced-correction', 'contrarian', 'yes-and'],
    avoid: ['framework', 'personal-story'],
    note: 'Either challenge it sharply, offer nuanced correction, or add surprising agreement with a twist.',
    lengthHint: 'short-preferred',
  },
  'personal-story': {
    primary: ['quick-react', 'personal-story', 'yes-and'],
    avoid: ['humor', 'contrarian', 'framework'],
    note: 'Show genuine empathy. NEVER be funny about vulnerability.',
    lengthHint: 'short-or-medium',
  },
  'announcement': {
    primary: ['question', 'yes-and', 'humor', 'quick-react'],
    avoid: ['contrarian', 'framework'],
    note: 'React genuinely or ask about implications.',
    lengthHint: 'any-bimodal',
  },
  'meme': {
    primary: ['humor', 'quick-react'],
    avoid: ['framework', 'contrarian', 'question', 'personal-story'],
    note: 'Be funny or do not reply. Under 50 chars ONLY. Never write a serious reply to a joke.',
    lengthHint: 'ultra-short',
  },
  'list-thread': {
    primary: ['question', 'yes-and', 'balanced-correction'],
    avoid: ['framework', 'personal-story'],
    note: 'Reference a specific point. Do not restate the whole list.',
    lengthHint: 'any-bimodal',
  },
};

export function selectStrategies(tweetType: TweetType): StrategyConfig {
  return STRATEGY_MAP[tweetType] || STRATEGY_MAP['statement'];
}

// ─── Anti-Pattern Scoring ────────────────────────────────────────────────────

const BANNED_OPENERS = [
  /^great (point|take|post|thread)/i,
  /^so true/i,
  /^this[.!]*$/i,
  /^love this/i,
  /^absolutely/i,
  /^i couldn't agree more/i,
  /^this resonates/i,
  /^well said/i,
  /^spot on/i,
  /^nailed it/i,
  /^couldn't have said it better/i,
];

const BANNED_PHRASES = [
  'it\'s worth noting',
  'at the end of the day',
  'game changer',
  'food for thought',
  'in today\'s world',
  'let\'s dive in',
  'the real story here',
  'the real question is',
  'what nobody is asking',
  'what\'s interesting is',
  'i think it\'s important',
  'it could be argued',
  'on one hand',
  'on the other hand',
];

const BANNED_WORDS = [
  'delve', 'tapestry', 'vibrant', 'crucial', 'comprehensive', 'meticulous',
  'seamless', 'groundbreaking', 'leverage', 'synergy', 'transformative',
  'paramount', 'multifaceted', 'myriad', 'cornerstone', 'reimagine',
  'empower', 'catalyst', 'robust', 'landscape', 'navigate', 'utilize',
  'furthermore', 'moreover', 'nevertheless', 'invaluable', 'profound',
  'realm', 'plethora', 'foster', 'bolster', 'showcase', 'commence',
  'facilitate', 'elucidate', 'augment', 'pivotal', 'underscore',
];

const HEDGING_PATTERNS = [
  /\bi think\b/i,
  /\bmaybe\b/i,
  /\bperhaps\b/i,
  /\bit could be\b/i,
  /\bpossibly\b/i,
  /\bmight be\b/i,
  /\bin my humble opinion\b/i,
  /\bimo\b/i,
];

export function scoreReply(replyText: string, tweetType: TweetType, strategy?: Strategy): ScoreResult {
  let score = 100;
  const issues: string[] = [];
  const len = replyText.length;
  const isBalancedCorrection = strategy === 'balanced-correction';
  
  // Length scoring (bimodal) — balanced-correction gets extended allowance
  if (len >= 50 && len <= 100) {
    score -= 20;
    issues.push('dead-zone-length (50-100 chars)');
  }
  if (isBalancedCorrection) {
    // Balanced corrections are naturally longer — only penalize 800+
    if (len > 800) {
      score -= 25;
      issues.push('too-long (800+ chars for correction)');
    }
  } else if (len > 400) {
    score -= 25;
    issues.push('too-long (400+ chars)');
  }
  if (tweetType === 'meme' && len > 50) {
    score -= 30;
    issues.push('meme-reply-too-long');
  }
  
  // Sycophantic opener check
  const firstLine = replyText.split('\n')[0].trim();
  for (const pattern of BANNED_OPENERS) {
    if (pattern.test(firstLine)) {
      score -= 40;
      issues.push('sycophantic-opener');
      break;
    }
  }
  
  // Banned phrases
  const lower = replyText.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
      score -= 15;
      issues.push(`banned-phrase: "${phrase}"`);
    }
  }
  
  // Banned words
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) {
      score -= 10;
      issues.push(`ai-word: "${word}"`);
    }
  }
  
  // Hedging
  for (const pattern of HEDGING_PATTERNS) {
    if (pattern.test(replyText)) {
      score -= 15;
      issues.push('hedging-language');
      break;
    }
  }
  
  // AI structural patterns
  if (/—/.test(replyText)) {
    score -= 5;
    issues.push('em-dash');
  }
  if (/;/.test(replyText) && len < 200) {
    score -= 5;
    issues.push('semicolon-in-short-reply');
  }
  if (/^"[^"]*"$/.test(replyText.trim())) {
    score -= 10;
    issues.push('wrapped-in-quotes');
  }
  
  // Context mismatch: question reply to a question tweet
  if (tweetType === 'question' && replyText.trim().endsWith('?') && !replyText.includes('\n')) {
    score -= 25;
    issues.push('re-questioning-a-question');
  }
  
  // Context mismatch: serious reply to meme
  if (tweetType === 'meme' && len > 100 && !/😂|💀|🤣|😅|lol|lmao|haha/i.test(replyText)) {
    score -= 30;
    issues.push('serious-reply-to-meme');
  }
  
  return { score: Math.max(0, score), issues };
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

export function buildSystemPrompt(tweetType: TweetType, strategies: StrategyConfig): string {
  const strategyInstructions = strategies.primary.map((s, i) => {
    const descs: Record<Strategy, string> = {
      'question': 'Ask a pointed follow-up question that adds a new angle. The question should imply insight.',
      'yes-and': 'Agree briefly, then add a genuinely novel observation the author did not mention.',
      'humor': 'Be genuinely funny. Clever wordplay, unexpected observation, or deadpan wit.',
      'quick-react': 'Ultra-short reaction. Under 20 chars. Emoji, one word, or a punchy fragment.',
      'personal-story': 'Share a brief, specific personal experience (1-2 sentences max).',
      'contrarian': 'Challenge one specific point with a sharp, brief objection.',
      'framework': 'Add a structured insight or relevant quote with attribution.',
      'balanced-correction': 'Acknowledge what\'s right, then pinpoint where it breaks down with specific examples. Synthesize a better framework. End with a quotable reframe or engagement question.',
    };
    return `Draft ${i + 1}: Use "${s}" strategy. ${descs[s] || ''}`;
  }).join('\n');
  
  const avoidList = strategies.avoid.map(s => `"${s}"`).join(', ');
  
  const hasBalancedCorrection = strategies.primary.includes('balanced-correction');
  
  const balancedCorrectionExample = hasBalancedCorrection ? `

BALANCED-CORRECTION EXAMPLE (model this structure):
---
Original tweet: "Stop doing work yourself. You're a CEO, not an intern. Every task should be delegated. Never write code, never read files, never do research manually."

Reply: "Not exactly right. Good advice for some workflows, but too absolute.

What's right:
• Orchestrator mindset is gold for complex multi-step work
• Parallel delegation beats sequential execution every time

Where it breaks down:
• 'Never do work yourself' is too rigid
• Reading a file? Just read it. Don't spawn a subagent to read a config
• Simple edits? Edit directly. Don't delegate 'fix typo in line 23'

The real pattern: Delegate when tasks are:
1. Complex (need their own context/reasoning)
2. Parallelizable (5 independent sub-tasks)
3. Time-intensive (research across many sources)

Act directly when overhead exceeds value.

The CEO framing is catchy, but even CEOs read their own emails sometimes. Context matters.

What do you think?"
---
KEY ELEMENTS of balanced-correction:
1. Soft correction opener (disarms without attacking)
2. "What's right" section — acknowledge valid points first
3. "Where it breaks down" — specific counter-examples, not vague disagreement
4. Synthesize a better framework — numbered criteria or clear rule
5. Quotable one-liner reframe near the end
6. Engagement hook (question or "what do you think?")
` : '';

  return `You are writing replies for X (Twitter). Your goal: maximum engagement through authenticity and wit.

TWEET TYPE DETECTED: ${tweetType}
${strategies.note}

GENERATE ${strategies.primary.length} DRAFTS using these specific strategies:
${strategyInstructions}
${balancedCorrectionExample}
HARD RULES:
- ${hasBalancedCorrection ? 'At least one non-correction draft MUST be under 50 characters' : 'At least one draft MUST be under 50 characters'}
- NO draft should be between 50-100 characters (dead zone — either go shorter or longer)
- ${hasBalancedCorrection ? 'The balanced-correction draft CAN be 200-600 characters — substance matters more than brevity for this strategy' : 'At most one draft over 200 characters'}
- NEVER open with: "Great point", "Love this", "So true", "This!", "Absolutely", "Well said"
- NEVER use hedging: "I think", "maybe", "perhaps", "it could be argued"
- NEVER use: delve, landscape, leverage, navigate, tapestry, robust, utilize, paramount, multifaceted
- NEVER use em dashes (—) or semicolons in short replies
- NEVER wrap the reply in quotation marks
- DO NOT use strategies: ${avoidList}
- Write like a real person texting a smart friend, not like an AI writing an essay
- Use contractions naturally (it's, don't, wouldn't)

Return a JSON array of objects with "text" field ONLY. Example:
[
  { "text": "reply text here" },
  { "text": "another reply" }
]`;
}

export function buildUserPrompt(tweetText: string, author: string): string {
  return `Reply to this tweet by @${author}:

"${tweetText}"

Generate your drafts now. Remember: write like a human, not an AI. Be specific, not generic.`;
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────

export function generateSmartReplies(tweetText: string, author: string = 'unknown'): PromptPackage {
  // Step 1: Classify
  const tweetType = classifyTweet(tweetText);
  
  // Step 2: Select strategies
  const strategies = selectStrategies(tweetType);
  
  // Step 3: Build prompts
  const systemPrompt = buildSystemPrompt(tweetType, strategies);
  const userPrompt = buildUserPrompt(tweetText, author);
  
  // Step 4: Return prompt package
  return {
    tweetType,
    strategies,
    systemPrompt,
    userPrompt,
    // Post-processing function to score results
    scoreAndFilter: (drafts) => {
      return drafts
        .map((d, i) => {
          // Map draft index to strategy for scoring context
          const draftStrategy = strategies.primary[i];
          const { score, issues } = scoreReply(d.text, tweetType, draftStrategy);
          return { ...d, score, issues, chars: d.text.length };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    }
  };
}
