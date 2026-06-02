import type { ChatApiResponse, KnowledgeChunk } from '@/lib/chatbot/types';

const MAX_MESSAGE_LENGTH = 500;
const MAX_SNIPPET_LINES = 5;

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

/** Offline portfolio Q&A from retrieved knowledge chunks (no OpenAI / no backend). */
export function buildLocalPortfolioReply(
  message: string,
  chunks: KnowledgeChunk[],
): ChatApiResponse {
  const trimmed = message.trim();
  if (!trimmed) {
    return { reply: 'Please ask a question about a project or experience on the site.', suggestedLinks: [] };
  }

  if (chunks.length === 0) {
    return {
      reply:
        'I could not find that in the portfolio. Try asking about a specific project, technology, or use the contact form to reach Hans directly.',
      suggestedLinks: [{ label: 'Contact', href: '/#contact' }],
    };
  }

  const body = chunks
    .slice(0, 3)
    .map((chunk, index) => {
      const lines = chunk.text.split('\n').map((l) => l.trim()).filter(Boolean);
      const snippet = lines.slice(0, MAX_SNIPPET_LINES).join('\n');
      return `${index + 1}. ${chunk.title}\n${snippet}`;
    })
    .join('\n\n');

  const suggestedLinks = chunks
    .filter((c) => c.href)
    .slice(0, 3)
    .map((c) => ({ label: c.title, href: c.href! }));

  return {
    reply: `Here is what the portfolio says:\n\n${body}\n\nOpen a case study link below for the full story, or book a call from the contact section.`,
    suggestedLinks,
  };
}

async function sendChatMessageRemote(params: {
  message: string;
  chunks: KnowledgeChunk[];
  conversationId: string;
}): Promise<ChatApiResponse> {
  const apiUrl = getChatApiUrl();
  if (!apiUrl) {
    throw new Error('Chat API is not configured');
  }

  const message = params.message.trim().slice(0, MAX_MESSAGE_LENGTH);
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

export async function sendChatMessage(params: {
  message: string;
  chunks: KnowledgeChunk[];
  conversationId: string;
}): Promise<{ response: ChatApiResponse; usedRemoteApi: boolean }> {
  const message = params.message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!message) {
    throw new Error('Message is empty');
  }

  if (getChatApiUrl()) {
    const response = await sendChatMessageRemote({ ...params, message });
    return { response, usedRemoteApi: true };
  }

  return {
    response: buildLocalPortfolioReply(message, params.chunks),
    usedRemoteApi: false,
  };
}
