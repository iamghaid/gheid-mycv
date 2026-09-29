import { notFound } from 'next/navigation';
import { COLLECTIONS } from '@shared/content/schema';
import type { CollectionKey } from '@shared/content/types';
import { getItem } from '@/lib/repo';
import { ItemEditor } from '@/components/ItemEditor';

export default async function ItemPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
    const { collection, id } = await params;
    if (!(collection in COLLECTIONS)) notFound();
    const config = COLLECTIONS[collection as CollectionKey];

    if (id === 'new') {
        return <ItemEditor collection={config.key} id={null} initial={config.defaults()} initialPublished />;
    }
    const item = await getItem(id);
    if (!item || item.collection !== config.key) notFound();
    return (
        <ItemEditor
            key={item.updatedAt}
            collection={config.key}
            id={item.id}
            initial={{ ...config.defaults(), ...(item.data as unknown as Record<string, unknown>) }}
            initialPublished={item.published}
        />
    );
}
