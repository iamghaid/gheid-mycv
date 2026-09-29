import { notFound } from 'next/navigation';
import { COLLECTIONS } from '@shared/content/schema';
import type { CollectionKey } from '@shared/content/types';
import { listItems } from '@/lib/repo';
import { CollectionList } from '@/components/CollectionList';

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
    const { collection } = await params;
    if (!(collection in COLLECTIONS)) notFound();
    const config = COLLECTIONS[collection as CollectionKey];
    const items = await listItems(config.key);
    return <CollectionList key={items.map((i) => i.id + i.sortOrder + i.published).join()} collection={config.key} items={items} />;
}
