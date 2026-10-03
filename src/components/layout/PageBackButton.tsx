'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

export function PageBackButton() {
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const visited = useRef<string[]>([]);

    useEffect(() => {
        if (!pathname) return;
        const routes = visited.current;
        if (routes.at(-1) === pathname) return;
        if (routes.at(-2) === pathname) routes.pop();
        else routes.push(pathname);
    }, [pathname]);

    if (!pathname || pathname === '/') return null;

    const goBack = () => {
        const internalReferrer = document.referrer && new URL(document.referrer).origin === window.location.origin;
        if (visited.current.length > 1 || (internalReferrer && window.history.length > 1)) router.back();
        else router.push('/');
    };

    return (
        <button type="button" onClick={goBack} className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-5 md:left-8 z-[90] inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-md hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={locale === 'ar' ? 'الرجوع للصفحة السابقة' : 'Go back to the previous page'}>
            <ArrowLeft className={`h-4 w-4 ${locale === 'ar' ? 'rotate-180' : ''}`} aria-hidden="true" />
            <span>{locale === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>
    );
}