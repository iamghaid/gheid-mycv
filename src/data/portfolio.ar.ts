/**
 * Arabic overlay for the portfolio data.
 *
 * Keyed by the same `id` as the English records in `portfolio.ts`, so the two files
 * stay aligned without duplicating the whole structure. Anything omitted here simply
 * falls back to the English value — useful for proper nouns (React, Firebase, GitHub)
 * that should not be translated.
 *
 * Read it through `useLocalizedPortfolio()` rather than importing it directly.
 */

export interface ArabicPersonal {
    name?: string;
    title?: string;
    subtitle?: string;
    bio?: string;
    location?: string;
    languages?: Record<string, { name?: string; level?: string }>;
}

export interface ArabicProject {
    title?: string;
    description?: string;
    longDescription?: string;
    role?: string;
    team?: string;
    category?: string;
    highlights?: string[];
    features?: { title: string; items: string[] }[];
    challengesAndSolutions?: { problem: string; solution: string }[];
}

export interface ArabicExperience {
    company?: string;
    position?: string;
    description?: string;
    responsibilities?: string[];
    location?: string;
}

export interface ArabicEducation {
    institution?: string;
    degree?: string;
    major?: string;
    achievements?: string[];
    activities?: string[];
}

export interface ArabicAchievement {
    title?: string;
    issuer?: string;
}

export interface ArabicGalleryItem {
    title?: string;
    description?: string;
    category?: string;
}

export const personalAr: ArabicPersonal = {
    name: 'غيد عبدالكريم',
    title: 'مهندسة برمجيات ومطوّرة ذكاء اصطناعي',
    subtitle: 'مهندسة برمجيات • مطوّرة ذكاء اصطناعي | أبني تطبيقات متكاملة وحلولًا مدعومة بالذكاء الاصطناعي',
    bio: 'طالبة علوم حاسب ومهندسة برمجيات من جدة، أبني تطبيقات ويب متكاملة وحلولًا مدعومة بالذكاء الاصطناعي. بدأت أكتب الكود من ٢٠٢٢ تقريبًا، وحوّلت ذلك إلى عمل حر احترافي في حلول الذكاء الاصطناعي والتطوير المتكامل من ٢٠٢٤. أشتغل على الأتمتة الذكية وهندسة البرومبت وتقنيات الذكاء الاصطناعي الحديثة، ويهمّني أن أُسلّم العمل كاملًا — من الفكرة إلى التصميم إلى النشر.',
    location: 'جدة، المملكة العربية السعودية',
    languages: {
        Arabic: { name: 'العربية', level: 'اللغة الأم' },
        English: { name: 'الإنجليزية', level: 'مستوى احترافي' },
        Turkish: { name: 'التركية', level: 'مستوى مبتدئ' },
    },
};

export const projectsAr: Record<string, ArabicProject> = {
    'project-qurb': {
        title: 'قُرب',
        description: 'منصة مخطّط لها مدعومة بالذكاء الاصطناعي لحلقات تحفيظ القرآن، حاليًا في مرحلة التخطيط والبحث.',
        longDescription:
            'قُرب هو مشروع تخرّجي — منصة مخطّط لها لدعم حلقات تحفيظ القرآن. تجاوزنا مرحلة توليد الفكرة ودخلنا التخطيط التقني: Firebase للواجهة الخلفية، وReact أو React Native للواجهة الأمامية، مع بحث مستمر عن مقاربة الذكاء الاصطناعي الأنسب لميزات دعم الحفظ. التطوير لم يبدأ بعد.',
        role: 'مطوّرة متكاملة (مشروع تخرّج)',
        team: 'مشروع شخصي / تخرّج',
        category: 'ذكاء اصطناعي وهندسة برمجيات',
        highlights: [
            'حاليًا في مرحلة التخطيط والبحث',
            'تم اعتماد Firebase مع React',
            'مقاربة الذكاء الاصطناعي قيد البحث',
        ],
        challengesAndSolutions: [
            {
                problem: 'إيجاد فكرة مشروع تخرّج واقعية التنفيذ ومفيدة فعلًا.',
                solution: 'قضيت وقتًا طويلًا في بحث المشكلة والتحقق من الفكرة قبل الالتزام بالتخطيط التقني.',
            },
        ],
    },
    'project-go-mission': {
        title: 'Go Mission',
        description: 'لعبة صفّية يتعاون فيها لاعبون بقيود حسّية وتواصلية مختلفة لإنجاز مهام يولّدها الذكاء الاصطناعي.',
        longDescription:
            'Go Mission لعبة تعاونية داخل الفصل الدراسي. يُسنَد لكل لاعب دور بقيود تواصلية أو حسّية محددة، وعلى المجموعة العمل معًا لإنجاز مهمة داخل الفصل رغم تلك القيود. المهام ليست مكتوبة مسبقًا — يولّدها الذكاء الاصطناعي بناءً على وصف لتخطيط الفصل وموارده المتاحة، فتكون كل مهمة قابلة للتنفيذ فعليًا في الغرفة التي تُلعب فيها.',
        role: 'مطوّرة',
        team: 'مشروع شخصي',
        category: 'هندسة برمجيات',
        highlights: [
            'مهام مولّدة بالذكاء الاصطناعي وواعية بالبيئة',
            'قيود لكل لاعب حسب دوره',
            'تجربة تعاونية مصمّمة للفصل الدراسي',
        ],
        challengesAndSolutions: [
            {
                problem: 'كان لا بدّ أن تكون المهام قابلة للإنجاز فعلًا بالأدوات والمساحة المتوفرة في كل فصل.',
                solution: 'صمّمت برومبت يزوّد الذكاء الاصطناعي بتفاصيل الفصل وموارده، فيولّد مهمة مفصّلة على ما هو ممكن في تلك البيئة تحديدًا.',
            },
        ],
    },
    'project-global-eagle-travel': {
        title: 'Global Eagle Travel',
        description: 'موقع سفر وسياحة بواجهة إدارية تتيح لغير المبرمجين تعديل محتوى الموقع مباشرة.',
        longDescription:
            'Global Eagle Travel موقع سفر وسياحة بُني ليتمكّن صاحب الموقع من تحديث المحتوى — كالترويسة وبقية الأقسام — دون لمس الكود. بنيت واجهة إدارية متصلة بـFirebase Realtime Database تتيح للمشرف تسجيل الدخول وتعديل محتوى الموقع مباشرة.',
        role: 'مطوّرة متكاملة',
        team: 'مشروع شخصي',
        category: 'هندسة برمجيات',
        highlights: ['واجهة إدارية لغير المبرمجين', 'إدارة محتوى لحظية عبر Firebase'],
        challengesAndSolutions: [
            {
                problem: 'احتاج الموقع أن يكون قابلًا للتعديل من مشرف غير تقني دون الحاجة لمبرمج مع كل تحديث محتوى.',
                solution: 'بنيت واجهة إدارية مخصّصة موصولة بـFirebase Realtime Database، فصارت التعديلات تتم عبر واجهة محمية بتسجيل دخول بدل الكود.',
            },
        ],
    },
    'project-marjan-al-sharq': {
        title: 'مرجان الشرق للخدمات الأمنية',
        description: 'تصميم الهوية البصرية والملف التعريفي لشركة خدمات أمنية، شاملًا الشعار ولوحة الألوان وملفًا من ٢٤ صفحة تقريبًا.',
        longDescription:
            'صمّمت الملف التعريفي والهوية البصرية لشركة مرجان الشرق للخدمات الأمنية — شاملًا الشعار ولوحة الألوان والاتجاه التصميمي العام — ونفّذت تنسيق ٢٤ صفحة تقريبًا للملف التعريفي للشركة.',
        role: 'مصمّمة',
        team: 'عمل حر',
        category: 'تصميم',
        highlights: ['تصميم الشعار والهوية البصرية', 'لوحة الألوان', 'ملف تعريفي من ٢٤ صفحة تقريبًا'],
    },
    'project-mizan': {
        title: 'ميزان',
        description: 'لوحة مزادات ثنائية اللغة تساعد المراجع على تقييم قدرة المزايد على إكمال السداد قبل اعتماد الترسية.',
        longDescription: 'بُني ميزان لمسار المزادات في هاكاثون إنفاذ للابتكار لمعالجة الفجوة بين إثبات هوية المزايد والتحقق من قدرته على السداد. يجمع مؤشرات الملاءة المالية وسجل السداد في المزادات ضمن مؤشر مخاطرة قابل للتفسير، ويعرض سلوك المزايدة الإحصائي كسياق ثانوي للمراجع. تتيح اللوحة استكشاف العوامل وتسجيل القرارات وإصدار تقرير أسبوعي. يحمّل العرض التجريبي بيانات مزادات مولّدة تلقائيًا. لا يوجد في هذه النسخة تكامل مباشر مع إنفاذ أو أبشر أو سمة؛ تصل البيانات المالية الاختيارية حاليًا عبر ملفات CSV. النتائج تدعم المراجعة البشرية ولا تمثّل حكمًا آليًا بالاحتيال.',
        role: 'مطوّرة بيانات وذكاء اصطناعي',
        team: 'فريق هاكاثون إنفاذ للابتكار',
        category: 'بيانات وذكاء اصطناعي',
        highlights: [
            'تقييم الملاءة المالية وسجل السداد قبل اعتماد الترسية',
            'بيانات عرض مولّدة: ٩٥٢ حدثًا و٢٢ مزادًا و٥٨ مزايدًا؛ ٥ حالات مرتفعة و٤ متوسطة المخاطرة',
            'مستويات مخاطرة قابلة للتفسير مع تفصيل نقاط كل عامل',
            'عرض البيانات المالية الغائبة كغير متوفرة بدل اعتبارها دليل سلامة',
            'لوحة عربية وإنجليزية تضم فلاتر ورسومًا وتقارير قابلة للطباعة',
            'عرض تلقائي للبورتفوليو باستخدام بيانات مولّدة',
        ],
        features: [
            { title: 'تقييم القدرة على السداد', items: ['إيقاف الخدمات والقروض غير المسددة والتعثرات السابقة', 'تغطية الضمان مقارنةً بأعلى مزايدة', 'الفوز السابق بلا سداد وتجاوز قيمة مزايدة سابقة متعثرة', 'أوزان واضحة ومستويات مخاطرة منخفضة ومتوسطة ومرتفعة'] },
            { title: 'لوحة المراجع', items: ['بحث عن المزايد وفرز وفلترة حسب مستوى المخاطرة', 'تفاصيل قابلة للتوسيع للعوامل والإجراء المقترح', 'تفسير عبر Claude أو Gemini مع بديل محلي عند التعذّر', 'حفظ قرارات المسؤول محليًا وتقارير أسبوعية قابلة للطباعة'] },
            { title: 'سلامة البيانات واكتمالها', items: ['تحليل ملفات CSV عبر واجهة Python', 'مؤشرات سلوكية ثانوية باستخدام Isolation Forest', 'ربط أحداث المزاد بسلسلة SHA-256', 'إظهار تغطية البيانات والعوامل غير المتوفرة بوضوح', 'واجهة عربية وإنجليزية ووضع فاتح وداكن وتصميم متجاوب'] },
        ],
        challengesAndSolutions: [
            { problem: 'التحقق من الهوية وحده لا يثبت قدرة الفائز بالمزاد على إكمال السداد.', solution: 'جمعت مؤشرات الملاءة المالية وسجل السداد في مؤشر قابل للتفسير يدعم المراجعة قبل الترسية.' },
            { problem: 'غياب البيانات المالية قد يعطي انطباعًا مضللًا بانخفاض المخاطرة.', solution: 'تتبّعت توافر الحقول وأظهرت نسبة تغطية البيانات والعوامل غير المتوفرة بدل احتسابها صفرًا.' },
            { problem: 'لم تتوفر سجلات مزايدين حقيقية أو تكاملات حكومية للنسخة التجريبية.', solution: 'استخدمت بيانات مولّدة موسومة بوضوح، مع توضيح حدود النسخة المعتمدة على CSV.' },
            { problem: 'تعذّر مزوّد الذكاء الاصطناعي قد يوقف تفسير النتيجة للمراجع.', solution: 'وفّرت تفسيرًا محليًا مبنيًا على أوزان المؤشر نفسها عند غياب المفتاح أو فشل المزوّد.' },
        ],
    },
};

export const experiencesAr: Record<string, ArabicExperience> = {
    'prof-mabda-ai': {
        company: 'مبدأ للذكاء الاصطناعي',
        position: 'مشاركة في ورشة الذكاء الاصطناعي والأتمتة',
        description: 'ورشة عملية مكثّفة لمدة ٣ أشهر حول الذكاء الاصطناعي والذكاء الاصطناعي التوليدي والأتمتة.',
        responsibilities: [
            'تطوير مهارات في هندسة البرومبت والذكاء الاصطناعي التوليدي والتصميم والتطوير بمساعدة الذكاء الاصطناعي',
            'بناء وكلاء ذكاء اصطناعي وسير عمل مؤتمت باستخدام n8n وWebhooks ونماذج الذكاء الاصطناعي',
            'توظيف أدوات الذكاء الاصطناعي في تطوير المواقع والمحتوى الرقمي وحلول الأعمال',
            'العمل ضمن فرق على مشاريع مشتركة وتقديم عروض تقنية',
        ],
        location: 'جدة، السعودية',
    },
    'prof-freelance-2024': {
        company: 'عمل حر / مستقلة',
        position: 'مطوّرة برمجيات وحلول ذكاء اصطناعي بالعمل الحر',
        description: 'عمل حر يمتد من التطوير المتكامل إلى الذكاء الاصطناعي التطبيقي، من فهم احتياج العميل حتى النشر.',
        responsibilities: [
            'تطوير تطبيقات ويب متجاوبة بتقنيات حديثة',
            'بناء حلول مدعومة بالذكاء الاصطناعي باستخدام نماذج اللغة الكبيرة وهندسة البرومبت',
            'دمج واجهات REST وخدمات الطرف الثالث',
            'إدارة المشاريع من طرف إلى طرف — التخطيط والتصميم والنشر',
            'تصميم ملفات تعريفية احترافية وتصاميم رقمية للشركات',
            'تصميم مساعدين أذكياء وسير عمل أتمتة ذكية (منها n8n)',
        ],
        location: 'جدة، السعودية',
    },
    'lead-entertainment-club': {
        company: 'النادي الترفيهي — الجامعة العربية المفتوحة',
        position: 'عضوة نادي',
        description: 'المساهمة في تنظيم وإدارة الأنشطة والفعاليات الطلابية ضمن النادي الترفيهي بالجامعة.',
        location: 'جدة، السعودية',
    },
    'lead-computer-club': {
        company: 'نادي الحاسب — الجامعة العربية المفتوحة',
        position: 'عضوة نادي',
        description: 'دعم الزميلات في المفاهيم التقنية والمساهمة في أنشطة نادي الحاسب ضمن كلية الدراسات الحاسوبية.',
        location: 'جدة، السعودية',
    },
    'vol-ana-ijabi': {
        company: 'نادي فتيات جدة × جمعية التنمية الإيجابية',
        position: 'مبادرة «أنا إيجابي» التطوعية',
        description: '٤٠ ساعة تطوّعية في المجالات المجتمعية والثقافية والتنظيمية.',
        location: 'جدة، السعودية',
    },
    'cert-hackathons-2026': {
        company: 'نيوتك · أفتر ميد · إنفاذ للابتكار',
        position: 'مشاركة في هاكاثونات',
        description: 'المشاركة في عدة هاكاثونات ببناء نماذج أولية مدعومة بالذكاء الاصطناعي: تحليل البيانات، وتقنيات الصحة، ومنصات نزاهة الأسواق وتسويق الأصول.',
        location: 'السعودية',
    },
};

export const educationAr: Record<string, ArabicEducation> = {
    'edu-aou': {
        institution: 'الجامعة العربية المفتوحة',
        degree: 'بكالوريوس العلوم',
        major: 'علوم الحاسب',
        achievements: ['قائمة الشرف — الفصل الدراسي الثاني ٢٠٢٦، كلية الدراسات الحاسوبية'],
        activities: ['النادي الترفيهي', 'نادي الحاسب'],
    },
};

export const achievementsAr: Record<string, ArabicAchievement> = {
    'ach-programming-creativity': {
        title: 'مسابقة الإبداع البرمجي — المركز الأول',
        issuer: 'كلية الدراسات الحاسوبية، الجامعة العربية المفتوحة — جدة',
    },
    'ach-ibm-skillsbuild': { title: 'خطة تعلّم EYOUTH', issuer: 'IBM SkillsBuild' },
    'ach-newtech-hackathon': { title: 'هاكاثون نيوتك — مسار تحليل البيانات', issuer: 'نيوتك' },
    'ach-afaq-ai': { title: 'آفاق للذكاء الاصطناعي — الدفعة الثالثة', issuer: 'eYouth × IBM SkillsBuild' },
    'ach-gdg-gemini': {
        title: 'تحليل البيانات باستخدام Gemini',
        issuer: 'مجموعة مطوّري جوجل (جامعات الملك خالد والمستقبل والقصيم)',
    },
    'ach-after-med': {
        title: 'هاكاثون أفتر ميد',
        issuer: 'مستشفى الأندلسية × كلية الطب × ذا بريدج',
    },
    'ach-mabda-ai': { title: 'إتقان الذكاء الاصطناعي', issuer: 'مبدأ للذكاء الاصطناعي' },
    'ach-ana-ijabi': {
        title: 'مبادرة «أنا إيجابي» التطوعية — ٤٠ ساعة',
        issuer: 'نادي فتيات جدة × جمعية التنمية الإيجابية',
    },
};

export const galleryAr: Record<string, ArabicGalleryItem> = {
    'gallery-after-med': {
        title: 'هاكاثون أفتر ميد',
        description: 'المشاركة في هاكاثون أفتر ميد — مستشفى الأندلسية × كلية الطب × ذا بريدج.',
        category: 'هاكاثونات',
    },
    'gallery-mabda-ai': {
        title: 'مبدأ للذكاء الاصطناعي — إتقان الذكاء الاصطناعي',
        description: 'صورة جماعية بعد إتمام ورشة مبدأ للذكاء الاصطناعي.',
        category: 'ورش عمل',
    },
    'gallery-aou-1': {
        title: 'فعالية الجامعة العربية المفتوحة',
        description: 'حفل تكريم وتسليم الشهادات في الجامعة العربية المفتوحة.',
        category: 'الجامعة',
    },
    'gallery-aou-2': {
        title: 'فعالية الجامعة العربية المفتوحة',
        description: 'حفل تكريم وتسليم الشهادات في الجامعة العربية المفتوحة.',
        category: 'الجامعة',
    },
};

/** Soft-skill names, translated for the skills page cards. */
export const softSkillsAr: Record<string, string> = {
    'Problem Solving': 'حل المشكلات',
    'Critical Thinking': 'التفكير النقدي',
    Communication: 'التواصل',
    Teamwork: 'العمل الجماعي',
    Leadership: 'القيادة',
    'Time Management': 'إدارة الوقت',
    Adaptability: 'المرونة والتكيّف',
    'Fast Learner': 'سرعة التعلّم',
    'Attention to Detail': 'الدقة في التفاصيل',
    'Analytical Thinking': 'التفكير التحليلي',
    'Decision Making': 'اتخاذ القرار',
    'Presentation Skills': 'مهارات العرض والتقديم',
    Chess: 'الشطرنج',
};

/**
 * Skill and tag chips shown on experience/achievement cards.
 *
 * Product and technology names (React, Firebase, n8n, LLMs) are intentionally absent
 * so they keep their Latin spelling in both languages.
 */
export const skillTagsAr: Record<string, string> = {
    'AI Agents': 'وكلاء ذكاء اصطناعي',
    'AI Prototyping': 'نمذجة أولية بالذكاء الاصطناعي',
    Communication: 'التواصل',
    Community: 'المجتمع',
    'Community Building': 'بناء المجتمع',
    'Community Engagement': 'المشاركة المجتمعية',
    'Data Analysis': 'تحليل البيانات',
    'Event Organization': 'تنظيم الفعاليات',
    'Generative AI': 'الذكاء الاصطناعي التوليدي',
    Hackathon: 'هاكاثون',
    Mentoring: 'الإرشاد والتوجيه',
    Participation: 'مشاركة',
    'Problem Solving': 'حل المشكلات',
    Programming: 'البرمجة',
    'Prompt Engineering': 'هندسة البرومبت',
    'Rapid Prototyping': 'النمذجة السريعة',
    'Team Collaboration': 'العمل ضمن فريق',
    Teamwork: 'العمل الجماعي',
    'Technical Support': 'الدعم التقني',
    Volunteering: 'العمل التطوعي',
};
