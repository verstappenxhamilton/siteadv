export const defaultStop = ['\n\nFIM'];

export function sanitizeInput(text: string): string {
  return text.replace(/[^\w\s.,!?@\-]/g, '');
}
