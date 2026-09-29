import 'server-only';
import { createHash, timingSafeEqual } from 'crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken, verifySessionToken } from './session';
import { clearFailures, recentFailures, recordFailedLogin } from './repo';

const MAX_FAILURES = 8; // per IP, per 15 minutes

const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest();
/** Constant-time comparison (hashing first makes lengths equal). */
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

async function clientIp(): Promise<string> {
    const h = await headers();
    return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        return { ok: false, error: 'The admin account is not configured (ADMIN_EMAIL / ADMIN_PASSWORD).' };
    }

    const ip = await clientIp();
    if ((await recentFailures(ip)) >= MAX_FAILURES) {
        return { ok: false, error: 'Too many attempts. Try again in 15 minutes.' };
    }

    const valid = safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase()) && safeEqual(password, adminPassword);
    if (!valid) {
        await recordFailedLogin(ip);
        return { ok: false, error: 'Incorrect email or password.' };
    }

    await clearFailures(ip);
    const token = await createSessionToken(adminEmail.trim().toLowerCase());
    (await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TTL_SECONDS,
    });
    return { ok: true };
}

export async function logout() {
    (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
    return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * Every server action and route handler that reads or writes content calls this.
 * The proxy already blocks unauthenticated page requests, but server actions are
 * plain POST endpoints, so they check again rather than trust the page.
 */
export async function requireAdmin() {
    const session = await getSession();
    if (!session) redirect('/login');
    return session;
}
