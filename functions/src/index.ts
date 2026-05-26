import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';
import { generatePortfolioReply, type ChatRequestBody } from './chat.js';

const openaiApiKey = defineSecret('OPENAI_API_KEY');

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.ip ?? 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count += 1;
  return true;
}

function getAllowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
  if (fromEnv?.length) return fromEnv;
  return ['https://elite-mob.github.io', 'http://localhost:8080', 'http://localhost:5173'];
}

function setCorsHeaders(
  req: { headers: { origin?: string } },
  res: { set: (key: string, value: string) => void },
): string | null {
  const origin = req.headers.origin ?? '';
  const allowed = getAllowedOrigins();
  const match = allowed.includes(origin) ? origin : allowed[0];
  if (match) {
    res.set('Access-Control-Allow-Origin', match);
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Vary', 'Origin');
  }
  return match;
}

export const chat = onRequest(
  {
    secrets: [openaiApiKey],
    cors: false,
    maxInstances: 10,
    timeoutSeconds: 30,
  },
  async (req, res) => {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const body = req.body as ChatRequestBody;
    if (!body?.message || !Array.isArray(body.chunks) || body.chunks.length === 0) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4.1-mini';
    const openai = new OpenAI({ apiKey: openaiApiKey.value() });

    try {
      const result = await generatePortfolioReply(openai, model, body);
      res.status(200).json(result);
    } catch (err) {
      console.error('chat error', err);
      res.status(500).json({ error: 'Failed to generate reply' });
    }
  },
);
