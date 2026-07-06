import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/lib/admin/supabase/server';
import { aggregateSummary, formatSummaryForPrompt } from '@/lib/admin/ai/aggregate';
import type { SummaryPeriod } from '@/lib/admin/supabase/types';
import { ADMIN_AI_SYSTEM_PROMPT } from '@/lib/admin/ai/prompts';

async function requireOwner(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: role, error } = await supabase.rpc('current_user_role');
  if (error || role !== 'owner') return false;
  return true;
}

function periodDates(period: SummaryPeriod): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  let start: Date;
  if (period === 'today') {
    start = now;
  } else if (period === '7d') {
    start = new Date(now.getTime() - 6 * 86400000);
  } else {
    start = new Date(now.getTime() - 29 * 86400000);
  }
  return { start: start.toISOString().slice(0, 10), end };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } }, { status: 401 });
  }
  if (!(await requireOwner(supabase))) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Hanya owner.' } }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') ?? 'today') as SummaryPeriod;
  const { start, end } = periodDates(period);

  const { data: cached } = await supabase
    .from('ai_summaries')
    .select('*')
    .eq('period_start', start)
    .eq('period_end', end)
    .maybeSingle();

  if (cached) {
    return NextResponse.json({ data: { summary_text: cached.summary_text, cached: true, generated_at: cached.generated_at } });
  }
  return NextResponse.json({ data: { cached: false } });
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { code: 'CONFIG_ERROR', message: 'GEMINI_API_KEY belum dikonfigurasi di server.' } },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } }, { status: 401 });
  }
  if (!(await requireOwner(supabase))) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Hanya owner.' } }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const period = (body.period ?? 'today') as SummaryPeriod;
  const force = body.force === true;
  const { start, end } = periodDates(period);

  if (!force) {
    const { data: cached } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('period_start', start)
      .eq('period_end', end)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({ data: { summary_text: cached.summary_text, cached: true, generated_at: cached.generated_at } });
    }
  }

  const summary = await aggregateSummary(period);
  const summaryText = formatSummaryForPrompt(summary);
  const google = createGoogleGenerativeAI({ apiKey });

  try {
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: ADMIN_AI_SYSTEM_PROMPT,
      prompt: `Berikut adalah data performa bisnis ${summary.period} untuk Rumah Makan Semayot:\n\n${summaryText}\n\nBuat ringkasan singkat untuk owner dengan format yang sudah ditentukan.`,
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    let fullText = '';
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    await supabase.from('ai_summaries').upsert(
      { period_start: start, period_end: end, summary_text: fullText },
      { onConflict: 'period_start,period_end' }
    );

    return NextResponse.json({ data: { summary_text: fullText, cached: false } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: { code: 'AI_ERROR', message: `Gagal generate summary: ${msg}` } },
      { status: 500 }
    );
  }
}
