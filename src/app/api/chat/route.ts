import { NextRequest, NextResponse } from 'next/server';
import { getSiteContent } from '@/lib/content/server';
import { buildView } from '@/lib/content/view';
import { checkChatRate, clientIp } from '@/lib/chat-rate-limit';

// ─── Build system prompt from portfolio data ─────────────────────────────────
async function buildSystemPrompt(locale: string = 'en'): Promise<string> {
    // Current content from the database, so the assistant knows about admin edits.
    const portfolioData = buildView(await getSiteContent(), locale === 'ar' ? 'ar' : 'en').portfolio;
    const { personal, projects, education, achievements, softSkills, tools } = portfolioData as any;
    // These keys were read as `experience` / `skills`, which do not exist, so the
    // assistant previously knew nothing about either.
    const experience = portfolioData.experiences as any[];
    const skills = portfolioData.hardSkills as any[];

    const projectList = (projects ?? [])
        .map((p: any) =>
            `- ${p.title} (${p.category}): ${p.description}. Tech: ${(p.techStack ?? []).join(', ')}. Role: ${p.role ?? 'Developer'}. ${p.demoUrl && p.demoUrl !== '#' ? `Demo: ${p.demoUrl}` : ''} ${p.repoUrl ? `Repo: ${p.repoUrl}` : ''}`
        )
        .join('\n');

    const expList = (experience ?? [])
        .map((e: any) =>
            `- ${e.role ?? e.position} at ${e.company} (${e.period ?? e.duration}): ${e.description ?? (e.responsibilities ?? []).join('; ')}`
        )
        .join('\n');

    const eduList = (education ?? [])
        .map((e: any) =>
            `- ${e.degree} at ${e.institution} (${e.period ?? e.duration}). ${e.description ?? ''}`
        )
        .join('\n');

    const skillList = (skills ?? [])
        .map((s: any) => `${s.name} (${s.level ?? s.proficiency ?? ''})`)
        .join(', ');

    const softSkillList = (softSkills ?? [])
        .map((s: any) => s.name ?? s)
        .join(', ');

    const toolList = (tools ?? [])
        .map((t: any) => t.name ?? t)
        .join(', ');

    const achievementList = (achievements ?? [])
        .map((a: any) => `- ${a.title}: ${a.description ?? ''}`)
        .join('\n');

    return `You are an AI assistant for ${personal.name}'s portfolio website. You are friendly, helpful, and knowledgeable about ${personal.name}'s background. Answer questions accurately based on the information below.

## Personal Info
- Name: ${personal.name}
- Title: ${personal.title}
- Subtitle: ${personal.subtitle}
- Bio: ${personal.bio}
- Location: ${personal.location}
- Email: ${personal.email}
- Languages: ${(personal.languages ?? []).map((l: any) => `${l.name} (${l.level})`).join(', ')}
- GitHub: ${(personal.socialLinks ?? []).find((s: any) => s.platform === 'GitHub')?.url ?? ''}
- LinkedIn: ${(personal.socialLinks ?? []).find((s: any) => s.platform === 'LinkedIn')?.url ?? ''}

## Projects (${(projects ?? []).length} total)
${projectList}

## Work Experience
${expList || 'See portfolio for details.'}

## Education
${eduList || 'Computer Science, Arab Open University.'}

## Technical Skills
${skillList || 'Full-stack development, prompt engineering, LLMs, AI agents.'}

## Soft Skills
${softSkillList || 'Leadership, Communication, Problem Solving.'}

## Tools & Technologies
${toolList || 'VS Code, Git, GitHub, Microsoft Office.'}

## Achievements & Certifications
${achievementList || 'See portfolio for details.'}

## Instructions
- Answer in ${locale === 'ar' ? 'Arabic' : 'English'} (the current interface language). However, if the user asks in a different language, feel free to respond in that language too, while maintaining a professionally friendly tone.
- Be concise but informative. Use bullet points for lists.
- If asked about something not in the portfolio, politely say you only have information about ${personal.name}'s portfolio.
- When recommending projects, include demo links if available.
- Always be positive and professional about ${personal.name}'s work.
- Do NOT make up information not present above.
- Greet users warmly and encourage them to explore the portfolio website.`;
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatRequest {
    messages: Message[];
    locale?: string;
}

// ─── Limits ──────────────────────────────────────────────────────────────────
const MAX_MESSAGES = 40; // per request; the UI sends at most the last 20
const MODEL_CONTEXT = 20; // messages actually passed to the model
const MAX_USER_CHARS = 1000;
const MAX_ASSISTANT_CHARS = 8000; // earlier replies echoed back by the UI
const MAX_TOTAL_CHARS = 30000;

// Shown as-is by the chat UI, in the visitor's language.
const MESSAGES = {
    en: {
        rateLimited: "You're sending messages a little too fast. Please wait a moment and try again.",
        dailyLimit: "You've reached today's message limit for this assistant. Please come back tomorrow.",
        tooLong: `Your message is too long. Please keep it under ${MAX_USER_CHARS} characters.`,
        invalid: 'Invalid request.',
        unavailable: 'The assistant is unavailable right now. Please try again later.',
        internal: 'Something went wrong. Please try again.',
    },
    ar: {
        rateLimited: 'أرسلت رسائل كثيرة بسرعة. انتظر قليلاً ثم حاول مرة أخرى.',
        dailyLimit: 'وصلت إلى الحد اليومي للرسائل مع المساعد. يمكنك المحاولة مرة أخرى غداً.',
        tooLong: `رسالتك طويلة جداً. يرجى ألا تتجاوز ${MAX_USER_CHARS} حرف.`,
        invalid: 'طلب غير صالح.',
        unavailable: 'المساعد غير متاح حالياً. يرجى المحاولة لاحقاً.',
        internal: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    },
};
type MessageKey = keyof typeof MESSAGES.en;

function fail(locale: 'en' | 'ar', key: MessageKey, status: number, headers?: HeadersInit) {
    return NextResponse.json({ error: MESSAGES[locale][key], code: key }, { status, headers });
}

/** Provider errors carry status and body for the server log only; they never reach the browser. */
class ProviderError extends Error {}

// ─── Groq API call ───────────────────────────────────────────────────────────
async function callGroq(messages: Message[], systemPrompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new ProviderError('GROQ_API_KEY not configured');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
            ],
            max_tokens: 1024,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new ProviderError(`Groq API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new ProviderError('Empty response from Groq');
    return content;
}

// ─── Gemini API call ─────────────────────────────────────────────────────────
// Current models: https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

async function callGemini(messages: Message[], systemPrompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ProviderError('GEMINI_API_KEY not configured');

    // Convert messages to Gemini format
    const geminiContents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }));

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
        {
            method: 'POST',
            // Key in a header, not the URL, so it can't end up in request logs.
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: geminiContents,
                generationConfig: {
                    // Leaves room for the model's own reasoning tokens, which count
                    // against this limit on current Gemini models.
                    maxOutputTokens: 2048,
                    temperature: 0.7,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new ProviderError(`Gemini API error ${response.status} (${GEMINI_MODEL}): ${errorBody}`);
    }

    const data = await response.json();
    const parts: { text?: string; thought?: boolean }[] = data?.candidates?.[0]?.content?.parts ?? [];
    const content = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join('');
    if (!content) throw new ProviderError(`Empty response from Gemini (finishReason: ${data?.candidates?.[0]?.finishReason ?? 'none'})`);
    return content;
}

// ─── Request validation ──────────────────────────────────────────────────────
function validate(body: ChatRequest): MessageKey | null {
    const list = body?.messages;
    if (!Array.isArray(list) || list.length === 0 || list.length > MAX_MESSAGES) return 'invalid';
    let total = 0;
    for (const msg of list) {
        if (!msg || typeof msg.content !== 'string' || !msg.content.trim()) return 'invalid';
        if (msg.role !== 'user' && msg.role !== 'assistant') return 'invalid';
        const max = msg.role === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
        if (msg.content.length > max) return msg.role === 'user' ? 'tooLong' : 'invalid';
        total += msg.content.length;
    }
    if (total > MAX_TOTAL_CHARS) return 'invalid';
    if (list[list.length - 1].role !== 'user') return 'invalid';
    return null;
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    let locale: 'en' | 'ar' = req.cookies.get('NEXT_LOCALE')?.value === 'ar' ? 'ar' : 'en';
    try {
        let body: ChatRequest;
        try {
            body = await req.json();
        } catch {
            return fail(locale, 'invalid', 400);
        }
        if (body?.locale === 'ar' || body?.locale === 'en') locale = body.locale;

        const problem = validate(body);
        if (problem) return fail(locale, problem, problem === 'tooLong' ? 413 : 400);

        // Checked before any provider call; only well-formed requests count.
        const rate = await checkChatRate(clientIp(req.headers));
        if (!rate.ok) {
            const key: MessageKey = rate.retryAfter > 60 ? 'dailyLimit' : 'rateLimited';
            return fail(locale, key, 429, { 'Retry-After': String(rate.retryAfter) });
        }

        // Only the recent part of the conversation goes to the model.
        const messages = body.messages.slice(-MODEL_CONTEXT).map(({ role, content }) => ({ role, content }));
        const systemPrompt = await buildSystemPrompt(locale);

        let reply: string;
        let provider: string;

        // Try Groq first, then fallback to Gemini
        try {
            reply = await callGroq(messages, systemPrompt);
            provider = 'groq';
        } catch (groqError) {
            console.warn('[Chat] Groq failed, falling back to Gemini:', groqError);
            try {
                reply = await callGemini(messages, systemPrompt);
                provider = 'gemini';
            } catch (geminiError) {
                console.error('[Chat] Gemini also failed:', geminiError);
                return fail(locale, 'unavailable', 503);
            }
        }

        return NextResponse.json({ reply, provider });
    } catch (error) {
        console.error('[Chat] Unexpected error:', error);
        return fail(locale, 'internal', 500);
    }
}

// ─── GET health check ─────────────────────────────────────────────────────────
export async function GET() {
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    return NextResponse.json({
        status: 'ok',
        providers: { groq: hasGroq, gemini: hasGemini },
    });
}
