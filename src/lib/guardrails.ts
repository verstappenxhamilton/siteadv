export const STOP_SEQUENCES = ['\n\nFIM'];
export function sanitize(input: string): string {
  return input.replace(/[\r\n]+/g, ' ').trim();
}
