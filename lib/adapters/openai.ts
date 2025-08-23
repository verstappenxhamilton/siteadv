import OpenAI from 'openai';
import { runtimeConfig } from '../config';

interface GenerateParams {
  messages: any[];
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  stop?: string[];
}

export async function generate(params: GenerateParams) {
  const client = new OpenAI({ apiKey: runtimeConfig.apiKeys.openai });
  const completion = await client.chat.completions.create({
    model: runtimeConfig.model,
    messages: params.messages,
    max_tokens: params.maxOutputTokens ?? runtimeConfig.maxOutputTokens,
    temperature: params.temperature ?? runtimeConfig.temperature,
    top_p: params.topP ?? runtimeConfig.topP,
    stop: params.stop ?? runtimeConfig.stopSequences
  });
  return completion.choices[0].message?.content || '';
}
