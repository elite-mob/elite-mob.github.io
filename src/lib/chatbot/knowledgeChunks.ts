import { projects } from '@/data/portfolioData';
import { buildKnowledgeChunks } from '@/lib/chatbot/buildKnowledgeChunks';
import type { KnowledgeChunk } from '@/lib/chatbot/types';
import chatKnowledgeJson from '@/data/chatKnowledge.json';

let cachedChunks: KnowledgeChunk[] | null = null;

/** Knowledge chunks for chat retrieval (build-time JSON or live portfolio data). */
export function getKnowledgeChunks(): KnowledgeChunk[] {
  if (cachedChunks) return cachedChunks;

  const fromJson = chatKnowledgeJson as { chunks?: KnowledgeChunk[] };
  if (fromJson.chunks?.length) {
    cachedChunks = fromJson.chunks;
    return cachedChunks;
  }

  cachedChunks = buildKnowledgeChunks(projects);
  return cachedChunks;
}
