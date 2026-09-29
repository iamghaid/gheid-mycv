import Link from 'next/link';
import { COLLECTIONS } from '@shared/content/schema';
import { contentVersion, counts, getSingleton } from '@/lib/repo';
import { storageMode } from '@/lib/storage';
import { PORTFOLIO_URL } from '@/lib/nav';

export default async function Overview() {
    const [c, version, profile, resume] = await Promise.all([counts(), contentVersion(), getSingleton('profile'), getSingleton('resume')]);
    const mode = storageMode();
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-semibold">Welcome{profile?.name.en ? `, ${profile.name.en.split(' ')[0]}` : ''}</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Changes you save here are stored in the database and appear on your portfolio immediately — no rebuild needed.
                </p>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.values(COLLECTIONS).map((col) => (
                    <Link key={col.key} href={`/${col.key}`} className="card p-4 transition hover:border-neutral-400">
                        <p className="text-sm text-neutral-500">{col.label} <span className="text-neutral-400">· {col.labelAr}</span></p>
                        <p className="mt-2 text-2xl font-semibold">{c[col.key]?.total ?? 0}</p>
                        <p className="text-xs text-neutral-400">{c[col.key]?.published ?? 0} published</p>
                    </Link>
                ))}
            </section>

            <section className="card divide-y divide-neutral-100 text-sm">
                <Row label="Public site" value={<a className="underline" href={PORTFOLIO_URL} target="_blank" rel="noreferrer">{PORTFOLIO_URL}</a>} />
                <Row label="Content version" value={String(version)} hint="Increases with every save; the public site refreshes when it changes." />
                <Row label="File storage" value={mode === 'blob' ? 'Vercel Blob' : 'Local disk (development)'} warn={mode !== 'blob' && process.env.NODE_ENV === 'production'} hint={mode !== 'blob' ? 'Connect a Blob store to this Vercel project to enable uploads in production.' : undefined} />
                <Row label="CV" value={resume?.url ? <a className="underline" href={resume.url} target="_blank" rel="noreferrer">{resume.fileName || 'Current CV'}</a> : 'Using the bundled resume.pdf'} />
            </section>
        </div>
    );
}

function Row({ label, value, hint, warn }: { label: string; value: React.ReactNode; hint?: string; warn?: boolean }) {
    return (
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
            <span className="text-neutral-500">{label}</span>
            <span className={`text-right ${warn ? 'text-amber-700' : ''}`}>
                {value}
                {hint && <span className="block text-xs text-neutral-400">{hint}</span>}
            </span>
        </div>
    );
}
