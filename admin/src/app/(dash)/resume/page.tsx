import { SINGLETONS } from '@shared/content/schema';
import { getSingleton, singletonUpdatedAt } from '@/lib/repo';
import { SingletonEditor } from '@/components/SingletonEditor';
import { previewUrl } from '@/lib/nav';

export default async function ResumePage() {
    const config = SINGLETONS.resume;
    const [data, updatedAt] = await Promise.all([getSingleton('resume'), singletonUpdatedAt('resume')]);
    return (
        <SingletonEditor key={updatedAt} singleton="resume" updatedAt={updatedAt} initial={{ ...config.defaults(), ...(data ?? {}) }}>
            <div className="card p-4 text-sm text-neutral-600">
                {data?.url ? (
                    <>Current CV: <a className="underline" href={previewUrl(data.url)} target="_blank" rel="noreferrer">{data.fileName || data.url}</a>
                        {data.updatedAt && <> — updated {new Date(data.updatedAt).toLocaleString()}</>}</>
                ) : (
                    <>No CV uploaded yet — the site shows the bundled <code>resume.pdf</code>. Upload a PDF below and save; the site switches to it immediately.</>
                )}
            </div>
        </SingletonEditor>
    );
}
