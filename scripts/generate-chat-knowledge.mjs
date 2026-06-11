/**
 * Regenerate src/data/chatKnowledge.json from portfolio data.
 * Run: node scripts/generate-chat-knowledge.mjs
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const root = process.cwd();

const server = await createServer({
  root,
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const { buildKnowledgeChunks } = await server.ssrLoadModule(
    '/src/lib/chatbot/buildKnowledgeChunks.ts',
  );
  const { projects } = await server.ssrLoadModule('/src/data/portfolioData.ts');
  const chunks = buildKnowledgeChunks(projects);
  const out = {
    generatedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    chunks,
  };
  const target = resolve(root, 'src/data/chatKnowledge.json');
  writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Wrote ${chunks.length} chunks to src/data/chatKnowledge.json`);
} finally {
  await server.close();
}
