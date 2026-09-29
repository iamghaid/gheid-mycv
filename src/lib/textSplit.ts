/**
 * Splitting text for per-letter animations, without breaking Arabic.
 *
 * Arabic is a cursive script: a letter's shape depends on its neighbours, and the
 * whole word is laid out as one bidirectional run. Putting each character in its own
 * `inline-block` span — the usual trick for staggered letter animations — destroys
 * both: every letter falls back to its isolated form, and the inline-blocks are
 * ordered left-to-right, so the word renders scrambled and disconnected.
 *
 * These helpers keep Arabic words whole and only split scripts where per-character
 * splitting is safe.
 */

/** Arabic, Arabic Supplement/Extended, and the presentation-form blocks. */
const ARABIC_PATTERN =
    /[؀-ۿݐ-ݿࡰ-ࢎࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** True when the text contains any Arabic letter. */
export function hasArabic(text: string): boolean {
    return ARABIC_PATTERN.test(text);
}

/**
 * The units a staggered animation should step through.
 *
 * Latin text splits per character. Any word containing Arabic stays whole, so its
 * letters keep their connected forms and their right-to-left order.
 */
export function splitForAnimation(text: string): string[] {
    if (!hasArabic(text)) return Array.from(text);
    // Keep the separators so spacing survives the round trip.
    return text.split(/(\s+)/).filter((part) => part.length > 0);
}

/**
 * Whether a scramble/shuffle effect is safe to run on this text.
 *
 * Randomising Arabic characters produces disconnected nonsense rather than the
 * intended "decoding" effect, so callers should render the final text directly.
 */
export function canScramble(text: string): boolean {
    return !hasArabic(text);
}
