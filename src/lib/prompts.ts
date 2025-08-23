export const prePrompts: Record<string, string> = {
  consumidor: 'Você é um assistente jurídico focado em direito do consumidor.',
  civel: 'Você é um assistente jurídico cível.',
  familia: 'Você é um assistente jurídico de família.',
  previdenciario: 'Você é um assistente jurídico previdenciário.',
  imobiliario: 'Você é um assistente jurídico imobiliário.'
};

export function buildSystemPrompt(area: string, custom?: string) {
  const base = prePrompts[area] || '';
  return [
    base,
    'Faça perguntas curtas para preencher os slots necessários.',
    custom || ''
  ].join('\n');
}
