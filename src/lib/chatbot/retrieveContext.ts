import type { KnowledgeChunk } from '@/lib/chatbot/types';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 0;

  let score = 0;
  const titleLower = chunk.title.toLowerCase();
  const textLower = chunk.text.toLowerCase();
  const keywordSet = new Set(chunk.keywords);

  for (const token of queryTokens) {
    if (keywordSet.has(token)) score += 4;
    if (titleLower.includes(token)) score += 3;
    if (textLower.includes(token)) score += 1;
  }

  return score;
}

/** Return top knowledge chunks for a user message (local retrieval, no API). */
export function retrieveContextChunks(
  chunks: KnowledgeChunk[],
  message: string,
  limit = 5,
): KnowledgeChunk[] {
  const queryTokens = tokenize(message);
  if (queryTokens.length === 0) {
    return chunks.filter((c) => c.id.startsWith('site-')).slice(0, limit);
  }

  return [...chunks]
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, queryTokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.chunk);
}
