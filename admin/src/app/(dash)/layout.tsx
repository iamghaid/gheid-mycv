import { requireAdmin } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';

export default async function DashLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAdmin();
    return (
        <div className="lg:flex">
            <Sidebar email={session.email} />
            <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
                <div className="mx-auto max-w-5xl">{children}</div>
            </main>
        </div>
    );
}
