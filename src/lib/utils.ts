import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Month + year for a date, in the given locale.
 *
 * `locale` is optional so existing English call sites keep working; pass the value
 * from `useLocale()` to render Arabic month names. The Arabic form uses Latin digits
 * (`ar-SA-u-nu-latn`) because the surrounding UI mixes them with Latin project names.
 */
export function formatDate(input: string | number, locale?: string): string {
    const date = new Date(input)
    if (Number.isNaN(date.getTime())) {
        return locale === "ar" ? "التاريخ غير محدد" : "Date not specified"
    }
    const tag = locale === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-US"
    return date.toLocaleDateString(tag, {
        month: "long",
        year: "numeric",
    })
}
