import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ensureReady } from '@/lib/db';
import { LoginForm } from './LoginForm';

/** Setup problems are shown here rather than as a crash, so first deploys are easy to diagnose. */
async function setupProblems(): Promise<string[]> {
    const problems: string[] = [];
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) problems.push('ADMIN_EMAIL and ADMIN_PASSWORD are not set.');
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) problems.push('AUTH_SECRET must be set (at least 32 random characters).');
    try {
        await ensureReady(); // creates the tables and imports the initial content on first run
    } catch (err) {
        problems.push(`Database: ${(err as Error).message}`);
    }
    return problems;
}

export default async function LoginPage() {
    if (await getSession()) redirect('/');
    const problems = await setupProblems();
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="card w-full max-w-sm p-6 shadow-sm">
                <h1 className="text-xl font-semibold">Portfolio admin</h1>
                <p className="mt-1 text-sm text-neutral-500">لوحة إدارة المحتوى — sign in to manage your site.</p>
                {problems.length > 0 && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <p className="font-medium">Setup needed</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
                    </div>
                )}
                <LoginForm />
            </div>
        </main>
    );
}
