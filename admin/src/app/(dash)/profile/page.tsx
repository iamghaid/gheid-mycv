import { SINGLETONS } from '@shared/content/schema';
import { getSingleton, singletonUpdatedAt } from '@/lib/repo';
import { SingletonEditor } from '@/components/SingletonEditor';

export default async function ProfilePage() {
    const config = SINGLETONS.profile;
    const [data, updatedAt] = await Promise.all([getSingleton('profile'), singletonUpdatedAt('profile')]);
    return <SingletonEditor key={updatedAt} singleton="profile" updatedAt={updatedAt} initial={{ ...config.defaults(), ...(data ?? {}) }} />;
}
