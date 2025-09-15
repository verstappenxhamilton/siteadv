const express = require('express');
const { z } = require('zod');

const router = express.Router();

const configSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'groq', 'gemini']).optional(),
  parameters: z.object({
    model: z.string().optional(),
    max_output_tokens: z.number().optional(),
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    stop_sequences: z.array(z.string()).optional()
  }).partial().optional(),
  prompt: z.string().optional(),
  features: z.object({ upload: z.boolean().optional(), ocr: z.boolean().optional() }).partial().optional(),
  limits: z.object({ maxMessages: z.number().optional(), maxChars: z.number().optional() }).partial().optional()
});

const keySchema = z.object({
  openai: z.string().optional(),
  anthropic: z.string().optional(),
  groq: z.string().optional(),
  gemini: z.string().optional()
});

module.exports = (adminConfig, reports) => {
  router.get('/config', (req, res) => {
    const safe = { ...adminConfig };
    delete safe.apiKeys;
    res.json(safe);
  });

  router.post('/config', (req, res) => {
    const parsed = configSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_config' });
    Object.assign(adminConfig, parsed.data);
    res.json({ ok: true });
  });

  router.post('/keys', (req, res) => {
    const parsed = keySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_keys' });
    adminConfig.apiKeys = { ...adminConfig.apiKeys, ...parsed.data };
    res.json({ ok: true });
  });

  router.get('/keys', (req, res) => {
    res.json(adminConfig.apiKeys);
  });

  router.get('/reports', (req, res) => {
    res.json(reports);
  });

  return router;
}
