# Contributing

Thanks for taking a look at the portfolio. Focused bug reports and improvements are welcome.

## Report an issue

Include the page URL, steps to reproduce, expected behavior, and browser/device details. For layout bugs, add a screenshot and specify the language and theme. Do not include credentials or private contact-form submissions.

## Make a change

1. Fork the repository and create a branch for one focused change.
2. Follow `AGENTS.md` and the relevant bundled Next.js documentation.
3. Keep Arabic and English copy aligned and check RTL layout when changing the interface.
4. Run `npx tsc --noEmit` and `npm run build`.
5. Verify the affected pages at mobile and desktop sizes, in light and dark themes.
6. Open a pull request describing the behavior changed and how you checked it.

Use your own integration credentials and development database. Keep environment files out of commits, preserve existing license notices, and avoid changing personal content or publishing documents as part of a code fix.
