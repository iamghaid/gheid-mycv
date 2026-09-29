import { listMedia } from '@/lib/repo';
import { MediaLibrary } from '@/components/MediaLibrary';

export default async function MediaPage() {
    return <MediaLibrary media={await listMedia()} />;
}
