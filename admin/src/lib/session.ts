import { SignJWT, jwtVerify } from 'jose';

/**
 * Session tokens (edge-safe: used by the proxy and by server code).
 *
 * The session is an HS256-signed JWT in an httpOnly, SameSite=Lax cookie. It holds
 * no secrets — only the admin email and an expiry.
 */
export const SESSION_COOKIE = 'admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function key(): Uint8Array {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('AUTH_SECRET must be set to a random string of at least 32 characters.');
    }
    return new TextEncoder().encode(secret);
}

export async function createSessionToken(email: string): Promise<string> {
    return new SignJWT({ sub: email, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
        .sign(key());
}

export async function verifySessionToken(token: string | undefined): Promise<{ email: string } | null> {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
        if (payload.role !== 'admin' || typeof payload.sub !== 'string') return null;
        // A changed ADMIN_EMAIL invalidates existing sessions.
        if (process.env.ADMIN_EMAIL && payload.sub.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) return null;
        return { email: payload.sub };
    } catch {
        return null;
    }
}
