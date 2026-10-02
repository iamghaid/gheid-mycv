import React from 'react';

export interface Project {
    id: string;
    slug: string;
    title: string;
    description: string;
    longDescription?: string;
    image?: string;
    techStack: string[];
    tools: string[];
    status: 'ongoing' | 'completed' | 'planned';
    demoUrl?: string;
    repoUrl?: string;
    documentUrl?: string;
    documentUrlAr?: string;
    startDate: string;
    endDate?: string;
    highlights?: string[];
    challenges?: string[];
    category?: string;
    features?: { title: string; items: string[] }[];
    installation?: { title: string; cmd?: string; code?: string; type: 'code' | 'text' }[];
    challengesAndSolutions?: { problem: string; solution: string }[];
    galleryImages?: string[];
    team?: string;
    customTimeline?: string;
    role?: string;
    featured?: boolean;
    /** 'auto' embeds the live site when it allows framing; 'off' always shows the screenshot. */
    embedMode?: 'auto' | 'off';
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    description: string;
    responsibilities?: string[];
    skills: string[];
    startDate: string;
    endDate?: string;
    isOngoing: boolean;
    location?: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'volunteer' | 'apprenticeship' | 'self-employed' | 'training';
    logo?: string;
    /** Set when the logo is dark artwork on a transparent background. */
    logoInvertInDark?: boolean;
    logoBg?: string;
    link?: string;
    galleryImages?: string[];
    externalLink?: string | string[];
    keyLearnings?: string[];
    impact?: string[];
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    major: string;
    startDate: string;
    endDate?: string;
    isOngoing: boolean;
    gpa?: string;
    activities?: string[];
    achievements?: string[];
}

export interface Achievement {
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
    image?: string;
    credentialUrl?: string;
    credentialId?: string;
    tags?: string[];
    type?: string;
    category: 'certification' | 'award' | 'recognition' | 'publication' | 'competition' | 'hackathon';
    /** Supporting documents/images. */
    files?: string[];
}

export interface Skill {
    name: string;
    icon?: string;
    iconInvertInDark?: boolean;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'data' | 'blockchain' | 'software' | 'cloud' | 'tools' | 'other';
    description?: string;
}

export interface TechStack {
    name: string;
    icon: string;
    category: 'language' | 'framework' | 'library' | 'database' | 'cloud' | 'tool';
    /** Set when the logo is dark artwork that needs inverting on dark backgrounds. */
    iconInvertInDark?: boolean;
    url?: string;
    relatedProjects?: string[];
}

export interface SoftSkill {
    name: string;
    description?: string;
}

export interface Tool {
    name: string;
    icon: string;
    category: 'ide' | 'design' | 'productivity' | 'devops' | 'communication' | 'other';
    /** Set when the logo is dark artwork that needs inverting on dark backgrounds. */
    iconInvertInDark?: boolean;
    relatedProjects?: string[];
}

export interface SocialLink {
    platform: string;
    url: string;
    icon: string;
    username?: string;
}

export interface Language {
    name: string;
    /** Display text, so it can be translated — not a fixed English enum. */
    level: string;
}

export interface FAQ {
    question: string;
    answer: string;
}

export interface PersonalInfo {
    name: string;
    title: string;
    subtitle: string;
    bio: string;
    avatar: string;
    /** Larger portrait used by the hero/identity sections. */
    heroImage?: string;
    location: string;
    email: string;
    phone?: string;
    website?: string;
    resumeUrl?: string;
    languages?: Language[];
    socialLinks: SocialLink[];
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    date: string;
    category: string;
    tags: string[];
    author: {
        name: string;
        avatar: string;
    };
    readTime: string;
}

export interface GalleryItem {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    category: string;
}

export interface PortfolioData {
    personal: PersonalInfo;
    projects: Project[];
    experiences: Experience[];
    education: Education[];
    achievements: Achievement[];
    techStack: TechStack[];
    hardSkills: Skill[];
    softSkills: SoftSkill[];
    tools: Tool[];
    faqs: FAQ[];
    blogs: BlogPost[];
    gallery: GalleryItem[];
}
