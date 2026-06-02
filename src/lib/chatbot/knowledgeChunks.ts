import type { KnowledgeChunk } from '@/lib/chatbot/types';

let cachedChunks: KnowledgeChunk[] | null = null;
let loadPromise: Promise<KnowledgeChunk[]> | null = null;

/** Loads chat knowledge on demand (keeps ~185KB JSON off the initial bundle). */
export function loadKnowledgeChunks(): Promise<KnowledgeChunk[]> {
  if (cachedChunks) return Promise.resolve(cachedChunks);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { default: chatKnowledgeJson } = await import('@/data/chatKnowledge.json');
    const fromJson = chatKnowledgeJson as { chunks?: KnowledgeChunk[] };
    if (fromJson.chunks?.length) {
      cachedChunks = fromJson.chunks;
      return cachedChunks;
    }

    const [{ buildKnowledgeChunks }, { projects }] = await Promise.all([
      import('@/lib/chatbot/buildKnowledgeChunks'),
      import('@/data/portfolioData'),
    ]);
    cachedChunks = buildKnowledgeChunks(projects);
    return cachedChunks;
  })();

  return loadPromise;
}
