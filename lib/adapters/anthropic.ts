import Anthropic from '@anthropic-ai/sdk';
import { runtimeConfig } from '../config';

interface GenerateParams {
  messages: any[];
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  stop?: string[];
}

export async function generate(params: GenerateParams) {
  const client = new Anthropic({ apiKey: runtimeConfig.apiKeys.anthropic });
  const response = await client.messages.create({
    model: runtimeConfig.model,
    messages: params.messages,
    max_tokens: params.maxOutputTokens ?? runtimeConfig.maxOutputTokens,
    temperature: params.temperature ?? runtimeConfig.temperature,
    top_p: params.topP ?? runtimeConfig.topP,
    stop_sequences: params.stop ?? runtimeConfig.stopSequences
  });
  const content = response.content?.[0];
  if (content?.type === 'text') {
    return content.text;
  }
  return '';
}
