import { SINGLETONS } from '@shared/content/schema';
import { getSingleton } from '@/lib/repo';
import { SingletonEditor } from '@/components/SingletonEditor';
import { previewUrl } from '@/lib/nav';

export default async function ResumePage() {
    const config = SINGLETONS.resume;
    const data = await getSingleton('resume');
    return (
        <SingletonEditor singleton="resume" initial={{ ...config.defaults(), ...(data ?? {}) }}>
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
