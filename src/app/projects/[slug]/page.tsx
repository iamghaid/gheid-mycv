import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { ProjectPageContent } from '@/components/projects/ProjectPageContent';
import { getSiteContent } from '@/lib/content/server';
import { buildView } from '@/lib/content/view';

/*
 * Rendered on request from the database, so a project added in the admin has a page
 * immediately (no build-time list of slugs).
 */
async function findProject(slug: string) {
    const locale = (await getLocale()) === 'ar' ? 'ar' : 'en';
    const view = buildView(await getSiteContent(), locale);
    return view.portfolio.projects.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const project = await findProject((await params).slug);
    if (!project) return { title: 'Project not found' };
    return {
        title: project.title,
        description: project.description,
        openGraph: {
            title: project.title,
            description: project.description,
            type: 'article',
            images: project.image ? [{ url: project.image }] : undefined,
        },
    };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const project = await findProject((await params).slug);
    if (!project) notFound();
    return <ProjectPageContent project={project} />;
}
