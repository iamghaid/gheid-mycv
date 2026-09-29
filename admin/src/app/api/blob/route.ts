import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES } from '@/lib/storage';

/**
 * Vercel Blob client-upload endpoint.
 *
 * 1. The admin's browser asks for an upload token — only granted to a signed-in admin.
 * 2. The browser uploads the file directly to Blob.
 * 3. Blob calls back here when done (signed by Blob, verified by handleUpload).
 * The file is registered in the media library by the browser afterwards.
 */
export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;
    try {
        const result = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
                if (!(await getSession())) throw new Error('Unauthorized');
                return {
                    allowedContentTypes: ALLOWED_TYPES,
                    maximumSizeInBytes: MAX_UPLOAD_BYTES,
                    addRandomSuffix: true,
                };
            },
            onUploadCompleted: async () => {
                /* registration happens in the browser via registerMediaAction */
            },
        });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
