"use client";
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { projectPresentationUrl, type ProjectPresentation } from '@/lib/project-presentation';
export function useProjectPresentation(raw?: string) {
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const preferences: ProjectPresentation = {
    language: locale === 'ar' ? 'ar' : 'en',
    theme: resolvedTheme === 'light' ? 'light' : 'dark',
  };
  return { preferences, url: projectPresentationUrl(raw, preferences) };
}
