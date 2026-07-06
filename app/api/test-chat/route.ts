import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { apiError } from '@/lib/http/responses';

export async function POST() {
  const testChatEnabled =
    process.env.NODE_ENV !== 'production' &&
    process.env.ENABLE_TEST_CHAT === 'true';

  if (!testChatEnabled) {
    return apiError(404, 'NOT_FOUND', 'Rute tidak tersedia.');
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return apiError(503, 'CONFIG_ERROR', 'Layanan chat uji tidak tersedia.');
  }

  const google = createGoogleGenerativeAI({ apiKey });

  const result = streamText({
    model: google('gemini-flash-lite-latest'),
    prompt: 'say exactly: Siap, dr. Alyn. SEMA hadir untuk membantu. Berikut adalah',
  });

  return result.toUIMessageStreamResponse();
}

