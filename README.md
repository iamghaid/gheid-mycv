<div align="center">

# Gheid Abdulkarim
### AI Engineer · Software Developer

A bilingual, interactive portfolio connecting applied AI, software projects, and research.

[**Explore the portfolio ↗**](https://gheid-mycv.vercel.app/) · [Projects](https://gheid-mycv.vercel.app/projects) · [Research & ideas](https://gheid-mycv.vercel.app/research) · [العربية](docs/README.ar.md)

![Next.js](https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-111111?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-111111?style=flat-square&logo=typescript)
![Vercel](https://img.shields.io/badge/Hosted_on-Vercel-111111?style=flat-square&logo=vercel)

</div>

![The live portfolio: applied AI, software engineering, and an interactive robot assistant](docs/images/portfolio-preview.png)

## More than a project gallery

This is the source for my personal portfolio: a place to explore what I build, the thinking behind it, and the experience that informs my work. Project pages bring together live previews, screenshots, technology details, and demos. Research pages distinguish complete studies from proposals and experimental ideas.

| Experience | What visitors can do |
| :--- | :--- |
| **Projects** | Filter the archive and explore individual case studies with live previews where embedding is permitted. |
| **Research & ideas** | Read research summaries, download available studies, and open companion dashboards. |
| **AI assistant** | Ask about my background, skills, projects, and experience from the hero robot or floating chat button. |
| **Arabic & English** | Switch language with RTL layouts and localized content; supported project demos inherit language and theme. |
| **Light & dark** | Explore the same visual identity in both themes, with responsive layouts for mobile and desktop. |
| **Experience & achievements** | Browse professional roles, certificates, and skills with supporting media. |
| **Resume & contact** | View or download my CV and send a message through the contact form. |
| **Interactive details** | Discover animated visuals, 3D elements, and physics-based technology interactions. |

## Selected work

These are separate projects presented by the portfolio, rather than applications implemented inside this repository.

| Project | Focus |
| :--- | :--- |
| [Mizan](https://gheid-mycv.vercel.app/projects/mizan) | Auction review dashboard and interpretable bidder assessment. |
| [Bayan](https://gheid-mycv.vercel.app/projects/bayan) | Experimental Friday-sermon accessibility with a Saudi sign-language avatar. |
| [Irth](https://gheid-mycv.vercel.app/projects/irth-vr) | Interactive Saudi craft exploration and a 3D customization prototype. |
| [Go Mission](https://gheid-mycv.vercel.app/projects/go-mission) | Bilingual classroom teamwork game with teacher and presentation views. |
| [Social media growth analysis](https://gheid-mycv.vercel.app/projects/social-media-growth-analysis) | Exploratory analysis of simulated Threads and TikTok growth data, with a companion dashboard. |

## Built with

**Interface:** Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, GSAP, and Lucide icons.

**Interactive visuals:** Three.js, React Three Fiber, Rapier, Matter.js, and OGL.

**Language & themes:** next-intl and next-themes.

**Content & services:** PostgreSQL, a separate Next.js admin app, optional Vercel Blob storage, Groq/Gemini chat providers, and Nodemailer for contact email. The public portfolio is hosted on Vercel.

## Run locally

Use Node.js 22 or newer and npm. The public site can render bundled content without a database; chat, email, and external statistics need their respective credentials.

```bash
git clone https://github.com/iamghaid/gheid-mycv.git
cd gheid-mycv
npm install
npm run dev
```

Open **http://localhost:3000**. Configure integrations in an untracked `.env.local` file:

| Variable | Purpose |
| :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL; use `http://localhost:3000` for development. |
| `DATABASE_URL` or `POSTGRES_URL` | PostgreSQL content database, if using the CMS. |
| `REVALIDATE_SECRET` | Shared secret for refreshing content after admin changes. |
| `GROQ_API_KEY` / `GEMINI_API_KEY` | AI assistant providers. Configure at least one for chat. |
| `EMAIL_USER` + `EMAIL_APP_PASSWORD` | Gmail sender and app password for the contact form. |
| `CONTACT_EMAIL` | Recipient for contact messages; defaults to the sender. |
| `GITHUB_TOKEN` | Optional GitHub statistics integration. |
| `WAKATIME_API_KEY` | Optional coding activity integration. |

For the database, admin login, uploads, and publishing flow, follow [CMS setup](docs/CMS_SETUP.md). Deploy the public app from the repository root and the admin app from `admin/`, using the same content database.

## Repository map

```text
src/app/              Pages and server API routes
src/components/       Layout, sections, project views, and interactive UI
src/lib/              Content loading and application utilities
messages/             Arabic and English interface translations
admin/                Separate authenticated content management application
shared/content/       Shared schema, types, SQL, and bundled seed content
public/               Site media, project previews, certificates, and studies
docs/                 Setup guide and repository previews
tests/                Project presentation checks
```

## Development checks

```bash
npx tsc --noEmit
npm run build
```

For interface changes, also check mobile and desktop layouts, both languages, both themes, and the affected interactions. See [Contributing](CONTRIBUTING.md) for the review checklist.

## Connect

[LinkedIn](https://www.linkedin.com/in/gheid-abdulkarim-6567872ab/) · [GitHub](https://github.com/iamghaid) · [Contact through the portfolio](https://gheid-mycv.vercel.app/contact)

## License & attribution

The code is distributed under the [MIT license](LICENSE), retaining the original template copyright notice. Third-party libraries and assets retain their own licenses. Portfolio content, certificates, research documents, and project branding may have separate rights; the code license does not grant rights to reuse those materials.
