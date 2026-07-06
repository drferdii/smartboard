import { createGoogle } from "@ai-sdk/google";
import { streamText } from "ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/semayot/chat-system-prompt";

export const runtime = 'edge';
export const maxDuration = 60; // Allow function to run up to 60 seconds

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Layanan chat sedang tidak tersedia." },
      { status: 500 }
    );
  }

  const google = createGoogle({ apiKey });

  const result = streamText({
    model: google("gemini-flash-lite-latest"),
    system: CHAT_SYSTEM_PROMPT,
    messages,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
