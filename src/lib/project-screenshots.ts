import type { ProjectPresentation } from './project-presentation';

/** Real captures of each bilingual site's current interface, in all four modes. */
const capturedProjects = new Set([
  'go-mission', 'mizan', 'muhla', 'irth-vr', 'global-eagle-travel',
]);

export function projectScreenshots(slug: string, presentation: ProjectPresentation) {
  if (!capturedProjects.has(slug)) return undefined;
  const base = `/project/previews/${slug}-${presentation.language}-${presentation.theme}`;
  return {
    image: `${base}-cover.jpg`,
    galleryImages: [`${base}-cover.jpg`, `${base}-detail.jpg`],
  };
}
