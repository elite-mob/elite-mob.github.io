import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';
import { generatePortfolioReply, type ChatRequestBody } from './chat.js';
import { createRateLimiter, getClientIp, setCorsHeaders } from './cors.js';
import { fetchStoreRating, parseStoreLink } from './appRating.js';

const openaiApiKey = defineSecret('OPENAI_API_KEY');

const chatRateLimit = createRateLimiter(20);
const ratingRateLimit = createRateLimiter(120);

export const chat = onRequest(
  {
    secrets: [openaiApiKey],
    cors: false,
    maxInstances: 10,
    timeoutSeconds: 30,
  },
  async (req, res) => {
    setCorsHeaders(req, res, 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const ip = getClientIp(req);
    if (!chatRateLimit(ip)) {
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

export const appRating = onRequest(
  {
    cors: false,
    maxInstances: 10,
    timeoutSeconds: 30,
  },
  async (req, res) => {
    setCorsHeaders(req, res, 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const ip = getClientIp(req);
    if (!ratingRateLimit(ip)) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const urlParam = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!urlParam || !parseStoreLink(urlParam)) {
      res.status(400).json({ error: 'Provide a valid App Store or Play Store url query param' });
      return;
    }

    try {
      const result = await fetchStoreRating(urlParam);
      res.status(200).json(result);
    } catch (err) {
      console.error('appRating error', err);
      res.status(502).json({ error: 'Could not fetch store rating' });
    }
  },
);
