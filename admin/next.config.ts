import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // The content model lives in ../shared (shared with the public portfolio), so
    // module resolution has to start from the repository root.
    turbopack: { root: path.join(__dirname, '..') },
    outputFileTracingRoot: path.join(__dirname, '..'),
    images: { unoptimized: true },
    experimental: {
        // Server actions receive whole records (and, in local mode, uploads).
        serverActions: { bodySizeLimit: '8mb' },
    },
};

export default nextConfig;
