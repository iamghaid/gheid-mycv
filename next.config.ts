import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** Admin origin whose /media/* serves uploads when developing without Vercel Blob. */
const adminMedia = (() => {
    const raw = process.env.ADMIN_MEDIA_ORIGIN;
    if (!raw) return null;
    const u = new URL(raw);
    return {
        protocol: u.protocol.replace(':', '') as 'http' | 'https',
        hostname: u.hostname,
        port: u.port,
        pathname: '/media/**',
    };
})();

const nextConfig: NextConfig = {
    // The content model lives in ./shared; the admin app (./admin) is a separate
    // Next.js project and must not be picked up by this one.
    turbopack: { root: __dirname },
    reactStrictMode: true,
    transpilePackages: ['three'],
    images: {
        // Only hosts the site actually loads from. unsplash / aceternity /
        // illustrations.popsy.co were template leftovers; popsy in particular was
        // unreachable and left whole sections blank.
        remotePatterns: [
            { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
            { protocol: 'https', hostname: 'upload.wikimedia.org' },
            // Files uploaded from the admin dashboard (Vercel Blob).
            { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
            // Local development: uploads served by the admin app.
            ...(adminMedia ? [adminMedia] : []),
        ],
        formats: ['image/avif', 'image/webp'],
        // Only for local development against the admin's /media on localhost; never
        // enabled in production (ADMIN_MEDIA_ORIGIN is not set there).
        dangerouslyAllowLocalIP: !!adminMedia && /^(localhost|127\.0\.0\.1)$/.test(adminMedia.hostname),
    },
};

export default withNextIntl(nextConfig);
