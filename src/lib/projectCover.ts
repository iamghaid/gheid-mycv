/**
 * Deterministic cover art for projects that have no photograph yet.
 *
 * Replaces the previous behaviour of pulling a random stock photo from
 * picsum.photos — those changed on every load and had nothing to do with the
 * work. A cover here is derived only from the project's own slug, title and
 * category, so the same project always renders the same artwork, it needs no
 * network request, and it reads as a deliberate design rather than a filler.
 *
 * Returned value is a `data:` URI, so it can be dropped straight into
 * `<Image src>` or a CSS `background-image`.
 */

/** Palette per project category — muted, works on both light and dark pages. */
const CATEGORY_PALETTE: Record<string, { from: string; to: string; ink: string }> = {
    'AI & Software Engineering': { from: '#1E6B52', to: '#0B2E24', ink: '#8FE3C4' },
    'Software Engineering': { from: '#1F3A6B', to: '#0B1730', ink: '#9EC1FF' },
    'Data & AI': { from: '#4A2E6B', to: '#1B1030', ink: '#C9A8FF' },
    Design: { from: '#8A6D1F', to: '#332708', ink: '#F0D689' },
    Research: { from: '#6B2E3B', to: '#2B1017', ink: '#F0A8B8' },
};

const FALLBACK_PALETTE = { from: '#2E2E2E', to: '#0E0E0E', ink: '#D4D4D4' };

/** Stable 32-bit hash — same input always yields the same layout. */
function hash(input: string): number {
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}

/** Initials used as the cover's focal mark, e.g. "Marjan Al Sharq" -> "MA". */
function initials(title: string): string {
    const words = title
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) return '••';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

export interface ProjectCoverOptions {
    slug: string;
    title: string;
    category?: string;
    width?: number;
    height?: number;
}

export function getProjectCover({
    slug,
    title,
    category,
    width = 800,
    height = 500,
}: ProjectCoverOptions): string {
    const palette = (category && CATEGORY_PALETTE[category]) || FALLBACK_PALETTE;
    const seed = hash(slug || title);

    // Diagonal angle and grid density vary per project so covers sitting side by
    // side stay distinguishable while still reading as one family.
    const angle = 15 + (seed % 60);
    const gridStep = 28 + (seed % 5) * 8;
    const ringOffset = 20 + (seed % 25);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${palette.from}"/>
      <stop offset="100%" stop-color="${palette.to}"/>
    </linearGradient>
    <pattern id="grid" width="${gridStep}" height="${gridStep}" patternUnits="userSpaceOnUse">
      <path d="M ${gridStep} 0 L 0 0 0 ${gridStep}" fill="none" stroke="${palette.ink}" stroke-opacity="0.10" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <circle cx="${width - ringOffset * 3}" cy="${ringOffset * 2}" r="${height * 0.42}" fill="none" stroke="${palette.ink}" stroke-opacity="0.14" stroke-width="1.5"/>
  <circle cx="${width - ringOffset * 3}" cy="${ringOffset * 2}" r="${height * 0.26}" fill="none" stroke="${palette.ink}" stroke-opacity="0.10" stroke-width="1.5"/>
  <text x="48" y="${height - 96}" fill="${palette.ink}" fill-opacity="0.95" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(height * 0.26)}" font-weight="700">${escapeXml(initials(title))}</text>
  <text x="50" y="${height - 52}" fill="${palette.ink}" fill-opacity="0.75" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="1.5">${escapeXml(truncate(title, 34))}</text>
  ${category ? `<text x="50" y="${height - 26}" fill="${palette.ink}" fill-opacity="0.45" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="2.5">${escapeXml(category.toUpperCase())}</text>` : ''}
</svg>`;

    // encodeURIComponent keeps the URI valid without pulling in a base64 polyfill,
    // and works identically on the server and in the browser.
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function truncate(value: string, max: number): string {
    return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
