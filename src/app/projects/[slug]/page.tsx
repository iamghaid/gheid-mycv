import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { portfolioData } from '@/data/portfolio';
import { ProjectPageContent } from '@/components/projects/ProjectPageContent';
import { getProjectImages } from '@/app/actions/getProjectImages';

export async function generateStaticParams() {
    return portfolioData.projects.map((project) => ({
        slug: project.slug,
    }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const project = portfolioData.projects.find((p) => p.slug === slug);

    if (!project) {
        return { title: 'Project not found' };
    }

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
    const { slug } = await params;
    const project = portfolioData.projects.find((p) => p.slug === slug);

    if (!project) {
        notFound();
    }

    // Picks up screenshots named <slug>1.png, <slug>2.png ... in public/project/
    // (webp/png/jpg/jpeg, up to 10) with no code change needed.
    const galleryImages = await getProjectImages(slug, project.title);

    const updatedProject = {
        ...project,
        image: galleryImages.length > 0 ? galleryImages[0] : project.image,
        galleryImages: galleryImages.length > 0 ? galleryImages : project.galleryImages,
    };

    return <ProjectPageContent project={updatedProject} />;
}
