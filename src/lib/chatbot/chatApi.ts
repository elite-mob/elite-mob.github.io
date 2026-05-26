import type { ChatApiResponse, KnowledgeChunk } from '@/lib/chatbot/types';

const MAX_MESSAGE_LENGTH = 500;

export function getChatApiUrl(): string | undefined {
  const raw = import.meta.env.VITE_CHAT_API_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href.replace(/\/$/, '') : undefined;
  } catch {
    return undefined;
  }
}

export async function sendChatMessage(params: {
  message: string;
  chunks: KnowledgeChunk[];
  conversationId: string;
}): Promise<ChatApiResponse> {
  const apiUrl = getChatApiUrl();
  if (!apiUrl) {
    throw new Error('Chat API is not configured');
  }

  const message = params.message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!message) {
    throw new Error('Message is empty');
  }

  const endpoint = apiUrl.endsWith('/chat') ? apiUrl : `${apiUrl}/chat`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      chunks: params.chunks.map((c) => ({
        id: c.id,
        title: c.title,
        text: c.text.slice(0, 2000),
        href: c.href,
      })),
      conversationId: params.conversationId,
    }),
  });

  if (!response.ok) {
    const errBody = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error ?? `Chat request failed (${response.status})`);
  }

  return (await response.json()) as ChatApiResponse;
}
