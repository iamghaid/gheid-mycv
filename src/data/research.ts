/**
 * Studies and hackathon submissions.
 *
 * Lives here rather than inside the research page so the home page can surface
 * the same list without the two drifting apart.
 */

export type ResearchItem = {
    id: string;
    title: string;
    titleAr: string;
    subtitle: string;
    date: string;
    context: string;
    summary: string;
    color: string;
    variant: 'simple' | 'stripe';
    fileUrl: string;
    fileLabel: string;
};

export const research: ResearchItem[] = [
    {
        id: 'qurb',
        title: 'Qurb',
        titleAr: 'قُرب',
        subtitle: 'Graduation Project — Full Study',
        date: '2026',
        context: 'Faculty of Computer Studies, Arab Open University',
        summary:
            "A smart GIS-based platform for Quranic memorization circles (Halaqas). Solves three real gaps found through stakeholder interviews: discovering nearby Halaqas via an interactive map, coordinating a substitute teacher automatically during emergencies via spatial matching, and generating personalized weekly revision schedules from daily oral evaluations.",
        color: '#1E6B52',
        variant: 'stripe',
        fileUrl: '/research/qurb-full-study.docx',
        fileLabel: 'Full Study (.docx)',
    },
    {
        id: 'istibaq',
        title: 'Istibaq',
        titleAr: 'استباق',
        subtitle: 'Madinah Hackathon 2026 — Smart Services Tracking Track',
        date: 'August 2026',
        context: 'Barmajan Al Munawwarah 2026',
        summary:
            'A platform protecting the mobility rights of people with disabilities and the elderly in Al Madinah. Two engines: a compliance engine that checks every street against official Universal Accessibility Code thresholds using the city\'s official geographic data, and a prediction engine that ranks routes at risk of losing accessibility within 60 days — before they actually fail.',
        color: '#0F6B5C',
        variant: 'stripe',
        fileUrl: '/research/istibaq.pdf',
        fileLabel: 'Full Study (PDF)',
    },
    {
        id: 'asl',
        title: 'Asl',
        titleAr: 'أصل',
        subtitle: 'Infaz Innovation Hackathon — Asset Marketing Track',
        date: 'August 2026',
        context: 'Qassim University × Infaz Assignment & Liquidation Center',
        summary:
            'An intelligent asset-marketing layer working alongside Infaz\'s existing sales process. Analyzes each asset and market data to identify the right buyer profile, then turns that analysis into a ready-to-review marketing plan and content — without replacing the sales agent or auction engine.',
        color: '#8A6D1F',
        variant: 'simple',
        fileUrl: '/research/asl-study.docx',
        fileLabel: 'Full Study (.docx)',
    },
    {
        id: 'mizan',
        title: 'Mizan',
        titleAr: 'ميزان',
        subtitle: 'Infaz Innovation Hackathon — Auctions Track',
        date: 'August 2026',
        context: 'Qassim University × Infaz Assignment & Liquidation Center',
        summary:
            "An intelligent integrity layer for auction platforms. Analyzes bidding behavior with explainable indicators to flag unusual patterns and recurring relationships between bidders, and builds a cryptographically-linked record that reveals any later tampering — surfacing findings as \"unusual pattern — recommended for review,\" never an automated fraud verdict.",
        color: '#4A4A4A',
        variant: 'simple',
        fileUrl: '/research/mizan-study.docx',
        fileLabel: 'Full Study (.docx)',
    },
    {
        id: 'fursa',
        title: 'Fursa',
        titleAr: 'فُرصة',
        subtitle: 'Opportunity Intelligence Platform — Team DataMinds',
        date: 'August 2026',
        context: 'Competition Submission',
        summary:
            'A market-opportunity intelligence platform for entrepreneurs and individual investors. Instead of starting from an idea and researching backward, Fursa starts from data — analyzing market gap, growth, demand, competition, and trend stability into a single explained FURSA Score, so decisions start from evidence rather than a hunch.',
        color: '#B5652B',
        variant: 'stripe',
        fileUrl: '/research/fursa-study.docx',
        fileLabel: 'Full Study (.docx)',
    },
    {
        id: 'voiceanatomy',
        title: 'VoiceAnatomy',
        titleAr: 'مساعد التشريح الذكي',
        subtitle: 'Interactive 3D Learning Assistant',
        date: '2026',
        context: 'Individual Project',
        summary:
            'An interactive 3D educational system for anatomy, controlled entirely through natural voice conversation in multiple languages. A student can simply ask "show me the heart" or "how does the respiratory system work?" and get an accurate 3D visualization with a spoken explanation — addressing the cost, visualization, and language barriers of traditional anatomy education.',
        color: '#7A2E3B',
        variant: 'simple',
        fileUrl: '/research/voiceanatomy-study.docx',
        fileLabel: 'Full Study (.docx)',
    },
];
