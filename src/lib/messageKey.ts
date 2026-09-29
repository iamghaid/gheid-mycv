/**
 * Turns a display name into a translation key.
 *
 * next-intl treats "." as a namespace separator, so a key like "Node.js" resolves as
 * namespace "Node" -> key "js" and throws INVALID_KEY. Names that reach messages as
 * lookup keys (tech names, project categories) go through this first.
 */
export function messageKey(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
