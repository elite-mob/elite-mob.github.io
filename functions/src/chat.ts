import OpenAI from 'openai';

export type ChatChunkInput = {
  id: string;
  title: string;
  text: string;
  href?: string;
};

export type ChatRequestBody = {
  message: string;
  chunks: ChatChunkInput[];
  conversationId?: string;
};

const SYSTEM_PROMPT = `You are the portfolio assistant on elite-mob.github.io.
Answer ONLY using the CONTEXT chunks provided. Do not use outside knowledge.
If the answer is not in the context, say you do not have that detail on the site and suggest the contact form or booking a call.
Never answer general knowledge, tutorials, politics, or unrelated coding help.
Keep replies concise (under 120 words), professional, and factual.
When referencing a project, mention its title and suggest the case study link if href is present.`;

function buildContextBlock(chunks: ChatChunkInput[]): string {
  return chunks
    .map((c, i) => {
      const link = c.href ? `\nLink: ${c.href}` : '';
      return `[${i + 1}] ${c.title}\n${c.text}${link}`;
    })
    .join('\n\n---\n\n');
}

function extractSuggestedLinks(chunks: ChatChunkInput[]): { label: string; href: string }[] {
  return chunks
    .filter((c) => c.href)
    .slice(0, 3)
    .map((c) => ({ label: c.title, href: c.href! }));
}

export async function generatePortfolioReply(
  openai: OpenAI,
  model: string,
  body: ChatRequestBody,
): Promise<{ reply: string; suggestedLinks: { label: string; href: string }[] }> {
  const message = body.message.trim().slice(0, 500);
  const chunks = (body.chunks ?? []).slice(0, 5);

  if (!message) {
    throw new Error('Message is required');
  }
  if (chunks.length === 0) {
    throw new Error('Context chunks are required');
  }

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 400,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `CONTEXT:\n${buildContextBlock(chunks)}\n\nQUESTION:\n${message}`,
      },
    ],
  });

  const reply =
    completion.choices[0]?.message?.content?.trim() ??
    'I could not find that in the portfolio. Please use the contact form or book a call.';

  return { reply, suggestedLinks: extractSuggestedLinks(chunks) };
}
