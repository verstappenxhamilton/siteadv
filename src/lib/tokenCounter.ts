export function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 0.75);
}
