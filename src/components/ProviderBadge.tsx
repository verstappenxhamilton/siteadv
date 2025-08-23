interface Props { provider: string; }
export default function ProviderBadge({ provider }: Props) {
  const colors: Record<string, string> = {
    openai: 'bg-blue-500',
    anthropic: 'bg-purple-500',
    groq: 'bg-orange-500'
  };
  return (
    <span className={`text-white px-2 py-1 text-xs rounded ${colors[provider] || 'bg-gray-500'}`}>
      {provider}
    </span>
  );
}
