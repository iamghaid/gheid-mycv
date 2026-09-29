/**
 * Local artwork for soft-skill cards.
 *
 * These cards used to load illustrations from illustrations.popsy.co. That host is
 * unreachable, every request failed silently, and the cards rendered as an empty
 * black area — several screens of nothing on the skills page. The artwork is now
 * generated locally as a `data:` URI: it always renders, needs no network, and
 * inherits the card's own accent colour instead of a stock illustration style.
 */

type Motif =
    | 'nodes'
    | 'branch'
    | 'waves'
    | 'orbit'
    | 'stack'
    | 'grid'
    | 'spark'
    | 'arrow';

/** Which motif suits which skill. Unknown skills fall back to a stable pick. */
const SKILL_MOTIF: Record<string, Motif> = {
    'Problem Solving': 'branch',
    'Problem-Solving': 'branch',
    'Critical Thinking': 'nodes',
    'Analytical Thinking': 'grid',
    'Systemic Thinking': 'orbit',
    Communication: 'waves',
    Teamwork: 'nodes',
    'Teamwork & Collaboration': 'nodes',
    Leadership: 'orbit',
    'Time Management': 'stack',
    Adaptability: 'arrow',
    'Fast Learner': 'spark',
    'Continuous Learning': 'spark',
    'Attention to Detail': 'grid',
    'Decision Making': 'branch',
    'Presentation Skills': 'waves',
    'Public Speaking': 'waves',
    'Research Skills': 'grid',
    Chess: 'grid',
};

const MOTIF_ORDER: Motif[] = ['nodes', 'branch', 'waves', 'orbit', 'stack', 'grid', 'spark', 'arrow'];

function hash(input: string): number {
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}

function motifPaths(motif: Motif, stroke: string): string {
    const s = `stroke="${stroke}" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;
    const dot = (cx: number, cy: number, r = 7) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${stroke}" fill-opacity="0.9"/>`;

    switch (motif) {
        case 'nodes':
            return `<path d="M60 150 L120 70 L180 130 L240 60" ${s}/>${dot(60, 150)}${dot(120, 70)}${dot(180, 130)}${dot(240, 60)}`;
        case 'branch':
            return `<path d="M50 170 L110 170 L110 90 L200 90 M110 170 L200 170 M200 90 L250 60 M200 90 L250 120" ${s}/>${dot(50, 170)}${dot(250, 60)}${dot(250, 120)}${dot(200, 170)}`;
        case 'waves':
            return `<path d="M40 110 Q80 50 120 110 T200 110 T280 110" ${s}/><path d="M40 160 Q80 100 120 160 T200 160 T280 160" ${s} stroke-opacity="0.5"/>`;
        case 'orbit':
            return `<ellipse cx="160" cy="115" rx="110" ry="45" ${s} stroke-opacity="0.55"/><ellipse cx="160" cy="115" rx="45" ry="105" ${s} stroke-opacity="0.35"/>${dot(160, 115, 16)}${dot(270, 115)}${dot(160, 10)}`;
        case 'stack':
            return `<rect x="70" y="50" width="180" height="34" rx="10" ${s}/><rect x="70" y="102" width="180" height="34" rx="10" ${s} stroke-opacity="0.7"/><rect x="70" y="154" width="180" height="34" rx="10" ${s} stroke-opacity="0.45"/>`;
        case 'grid':
            return `<path d="M70 50 H250 M70 105 H250 M70 160 H250 M100 30 V190 M160 30 V190 M220 30 V190" ${s} stroke-opacity="0.45"/>${dot(160, 105, 12)}`;
        case 'spark':
            return `<path d="M160 25 L182 96 L253 118 L182 140 L160 211 L138 140 L67 118 L138 96 Z" ${s}/>`;
        case 'arrow':
        default:
            return `<path d="M50 165 C 110 165, 110 70, 175 70 L245 70 M210 40 L245 70 L210 100" ${s}/>${dot(50, 165)}`;
    }
}

export interface SkillIllustrationOptions {
    /** Skill name — picks the motif and, as a fallback, seeds a stable one. */
    name: string;
    /** Stroke colour. Defaults to a neutral that reads on light and dark cards. */
    stroke?: string;
}

export function getSkillIllustration({
    name,
    stroke = '#9CA3AF',
}: SkillIllustrationOptions): string {
    const motif = SKILL_MOTIF[name] ?? MOTIF_ORDER[hash(name) % MOTIF_ORDER.length];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240" role="img" aria-label="${escapeXml(name)}">${motifPaths(motif, stroke)}</svg>`;

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
