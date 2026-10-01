export type ProjectPresentation = { language: 'en' | 'ar'; theme: 'light' | 'dark' };
export const PRESENTATION_MESSAGE = 'portfolio:presentation';
const supportedHosts = new Set([
  'go-mission.vercel.app', 'go-mission-gheid.vercel.app',
  'irth-vr.vercel.app', 'irth-vr-gheid.vercel.app',
  'mizan-kernel.vercel.app', 'mizan-gheid.vercel.app',
  'muhla.vercel.app', 'muhla-gheid.vercel.app',
  'eagle-azure.vercel.app', 'eagle-gheid.vercel.app',
]);
export function supportsProjectPresentation(raw?: string): boolean {
  try { const url = new URL(raw!); return url.protocol === 'https:' && supportedHosts.has(url.hostname); }
  catch { return false; }
}
export function projectPresentationUrl(raw: string | undefined, preferences: ProjectPresentation): string | undefined {
  if (!supportsProjectPresentation(raw)) return raw;
  const url = new URL(raw!);
  url.searchParams.set('portfolio_lang', preferences.language);
  url.searchParams.set('portfolio_theme', preferences.theme);
  return url.toString();
}
