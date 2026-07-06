import { streamText } from 'ai';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/lib/admin/supabase/server';
import { requireActiveUser, requireRole } from '@/lib/admin/auth';
import { aggregateSummary, formatSummaryForPrompt } from '@/lib/admin/ai/aggregate';
import { ADMIN_AI_SYSTEM_PROMPT } from '@/lib/admin/ai/prompts';
import { apiError } from '@/lib/http/responses';

export const runtime = 'edge';
export const maxDuration = 60; // Allow function to run up to 60 seconds

type MessageRole = 'user' | 'assistant';

type AdminChatRequestBody = {
  messages?: RawMessage[];
};

type RawMessagePart = {
  type?: string;
  text?: string;
};

type RawMessage = {
  role?: string;
  content?: string;
  parts?: RawMessagePart[];
};

function extractText(message: RawMessage): string {
  if (typeof message.content === 'string') return message.content;
  if (!Array.isArray(message.parts)) return '';

  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('');
}

function isSupportedRole(role: string | undefined): role is MessageRole {
  return role === 'user' || role === 'assistant';
}

export async function POST(request: Request) {
  // Check API key early — surface a clean error instead of a cryptic provider crash
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return apiError(503, 'CONFIG_ERROR', 'GEMINI_API_KEY belum dikonfigurasi di server.');
  }

  const supabase = await createClient();
  const auth = await requireActiveUser(supabase);
  if (!auth.ok) {
    return auth.response;
  }
  const roleError = requireRole(auth.profile, ['owner']);
  if (roleError) {
    return roleError;
  }
  const currentUserName = auth.profile.full_name || 'Admin';

  const body = (await request.json().catch(() => ({}))) as AdminChatRequestBody;
  const rawMessages = body.messages;
  if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
    return apiError(400, 'VALIDATION_ERROR', 'messages required');
  }

  // Build CoreMessage[] format that streamText expects
  const coreMessages = rawMessages
    .filter((message): message is RawMessage & { role: MessageRole } => isSupportedRole(message.role))
    .map((message) => ({
      role: message.role,
      content: extractText(message),
    }))
    .filter((m) => m.content.length > 0);

  if (coreMessages.length === 0) {
    return apiError(400, 'VALIDATION_ERROR', 'No valid message content found');
  }

  const summary = await aggregateSummary('today');
  let context = formatSummaryForPrompt(summary);

  // Fetch unread memories
  const { data: unreadMemories } = await supabase
    .from('sema_memories')
    .select('id, sender_name, content, created_at')
    .eq('is_read', false)
    .eq('recipient_name', currentUserName);

  if (unreadMemories && unreadMemories.length > 0) {
    context += `\n\n--- MEMORI & PESAN UNTUK ${currentUserName.toUpperCase()} ---\n`;
    context += `Anda memiliki ${unreadMemories.length} pesan belum dibaca:\n`;
    unreadMemories.forEach((m, idx) => {
      context += `${idx + 1}. Dari ${m.sender_name} (${new Date(m.created_at).toLocaleString()}): "${m.content}"\n`;
    });
    context += `\nPENTING: SEGERA sampaikan pesan ini kepada user di awal respons Anda, dan beri tahu mereka bahwa pesan telah Anda sampaikan. User ini adalah ${currentUserName}.`;
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const unreadMemoryIds = unreadMemories?.map((memory) => memory.id) ?? [];

  try {
    const result = streamText({
      model: google('gemini-flash-lite-latest'),
      system: ADMIN_AI_SYSTEM_PROMPT + '\n' + context,
      messages: coreMessages,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted }) => {
        if (isAborted || unreadMemoryIds.length === 0) {
          return;
        }

        await supabase
          .from('sema_memories')
          .update({ is_read: true })
          .eq('recipient_name', currentUserName)
          .in('id', unreadMemoryIds);
      },
    });
  } catch (error: unknown) {
    console.error('[api/admin/ai/chat]', error);
    return apiError(500, 'AI_ERROR', 'Gagal memproses chat AI.');
  }
}
