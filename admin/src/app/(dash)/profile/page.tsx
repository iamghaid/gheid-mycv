import { SINGLETONS } from '@shared/content/schema';
import { getSingleton } from '@/lib/repo';
import { SingletonEditor } from '@/components/SingletonEditor';

export default async function ProfilePage() {
    const config = SINGLETONS.profile;
    const data = await getSingleton('profile');
    return <SingletonEditor singleton="profile" initial={{ ...config.defaults(), ...(data ?? {}) }} />;
}
