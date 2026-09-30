import { COLLECTIONS, getPath } from '@shared/content/schema';
import type { CollectionKey } from '@shared/content/types';
import { TRASH_DAYS, listTrash, recordTitle } from '@/lib/repo';
import { TrashList, type TrashEntry } from '@/components/TrashList';

export default async function TrashPage() {
    const rows = await listTrash(); // also purges items older than TRASH_DAYS
    const entries: TrashEntry[] = rows.map((r) => {
        const config = COLLECTIONS[r.collection as CollectionKey];
        const image = config?.listImage ? String(getPath(r.data, config.listImage) ?? '') : '';
        const expires = new Date(r.created_at.getTime() + TRASH_DAYS * 86_400_000);
        return {
            targetId: r.target_id,
            collection: r.collection ?? '',
            collectionLabel: config?.label ?? r.collection ?? '',
            title: recordTitle(r.data) ?? 'Untitled',
            image,
            deletedAt: r.created_at.toISOString(),
            daysLeft: Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86_400_000)),
        };
    });
    return (
        <div className="space-y-5">
            <header>
                <h1 className="text-2xl font-semibold">Trash <span className="text-lg font-normal text-neutral-400">· سلة المحذوفات</span></h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Deleted items stay here for {TRASH_DAYS} days and are then removed automatically. They are not shown on the site.
                    Files they use stay protected in the media library until then.
                </p>
            </header>
            <TrashList entries={entries} />
        </div>
    );
}
