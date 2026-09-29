import 'server-only';

/**
 * Whether a website allows being shown inside an <iframe> on this site.
 *
 * Decided purely from the site's own response headers — X-Frame-Options and the CSP
 * `frame-ancestors` directive. If the site forbids framing we respect that and the
 * page shows a screenshot with an "Open live project" button instead; nothing tries
 * to work around the restriction.
 */
export type EmbedVerdict = { embeddable: boolean; reason: string };

export function verdictFromHeaders(headers: Headers, siteOrigin: string): EmbedVerdict {
    const xfo = headers.get('x-frame-options')?.toLowerCase().trim();
    if (xfo === 'deny' || xfo === 'sameorigin') return { embeddable: false, reason: `X-Frame-Options: ${xfo}` };

    const csp = headers.get('content-security-policy');
    const directive = csp
        ?.split(';')
        .map((d) => d.trim())
        .find((d) => d.toLowerCase().startsWith('frame-ancestors'));
    if (directive) {
        const sources = directive.split(/\s+/).slice(1).map((s) => s.toLowerCase());
        if (sources.includes("'none'")) return { embeddable: false, reason: "frame-ancestors 'none'" };
        if (sources.includes('*')) return { embeddable: true, reason: 'frame-ancestors *' };
        const host = new URL(siteOrigin).host.toLowerCase();
        const allowed = sources.some((s) => {
            if (s === "'self'") return false; // 'self' is the project's own origin, not ours
            const clean = s.replace(/^https?:\/\//, '').replace(/\/$/, '');
            if (clean.startsWith('*.')) return host.endsWith(clean.slice(1));
            return clean === host;
        });
        return allowed ? { embeddable: true, reason: 'frame-ancestors allows this site' } : { embeddable: false, reason: 'frame-ancestors excludes this site' };
    }
    return { embeddable: true, reason: 'no framing restrictions' };
}

export async function checkEmbeddable(url: string, siteOrigin: string): Promise<EmbedVerdict> {
    let target: URL;
    try {
        target = new URL(url);
    } catch {
        return { embeddable: false, reason: 'invalid URL' };
    }
    if (target.protocol !== 'https:') return { embeddable: false, reason: 'not HTTPS (browsers block mixed content)' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
        const res = await fetch(target, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
            headers: { 'user-agent': 'Mozilla/5.0 (portfolio embed check)' },
            cache: 'no-store',
        });
        res.body?.cancel().catch(() => undefined); // headers are all we need
        if (res.status >= 400) return { embeddable: false, reason: `site returned ${res.status}` };
        return verdictFromHeaders(res.headers, siteOrigin);
    } catch {
        return { embeddable: false, reason: 'site unreachable' };
    } finally {
        clearTimeout(timer);
    }
}
