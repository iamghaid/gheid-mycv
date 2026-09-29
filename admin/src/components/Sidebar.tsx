'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { NAV, PORTFOLIO_URL } from '@/lib/nav';
import { logoutAction } from '@/app/actions';

export function Sidebar({ email }: { email: string }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const groups = [...new Set(NAV.map((n) => n.group))];
    const active = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

    return (
        <>
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
                <span className="font-semibold">Portfolio admin</span>
                <button className="btn-ghost p-2" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            </div>
            {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-5 py-5">
                    <div>
                        <p className="font-semibold">Portfolio admin</p>
                        <p className="text-xs text-neutral-500">لوحة إدارة المحتوى</p>
                    </div>
                    <button className="btn-ghost p-1.5 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-4 w-4" /></button>
                </div>
                <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
                    {groups.map((g) => (
                        <div key={g}>
                            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{g}</p>
                            {NAV.filter((n) => n.group === g).map((n) => (
                                <Link
                                    key={n.href}
                                    href={n.href}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm ${active(n.href) ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
                                >
                                    <span>{n.label}</span>
                                    <span className={`text-xs ${active(n.href) ? 'text-white/60' : 'text-neutral-400'}`}>{n.labelAr}</span>
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="space-y-1 border-t border-neutral-200 p-3">
                    <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" className="btn-ghost w-full justify-start">
                        <ExternalLink className="h-4 w-4" /> View live site
                    </a>
                    <form action={logoutAction}>
                        <button className="btn-ghost w-full justify-start"><LogOut className="h-4 w-4" /> Sign out</button>
                    </form>
                    <p className="truncate px-3.5 pt-1 text-xs text-neutral-400">{email}</p>
                </div>
            </aside>
        </>
    );
}
