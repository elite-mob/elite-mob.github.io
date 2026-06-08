# Production Readiness Checklist

## Automated in CI

- `pnpm run check`, ESLint + TypeScript
- `pnpm run build`, Vite production build + sitemap generation
- GitHub Pages deploy (`.github/workflows/deploy.yml`)

## Before deploying

1. **GitHub Pages source**, Settings → Pages → **GitHub Actions** or **`gh-pages` / (root)** (never “Deploy from a branch → main”). If the site shows a blank page, open View Source: a broken deploy still has `<script src="/src/main.tsx">` instead of `/assets/index-*.js`.

2. **Environment variables** (see `.env.example`)
   - EmailJS: `VITE_EMAILJS_*` for the contact form
   - Optional: `VITE_CONTACT_EMAIL`, `VITE_SCHEDULE_MEETING_URL`, `VITE_CHAT_API_URL`
   - Firebase: `VITE_FIREBASE_*` for analytics and visit stats (see `docs/`)

2. **GitHub Secrets**, mirror the same `VITE_*` values for the deploy workflow.

3. **Manual smoke test**
   - Home, portfolio filters, project detail, privacy, 404
   - Contact form (with EmailJS configured)
   - Mobile menu and chatbot
   - Light/dark theme

4. **Local production preview**
   ```bash
   pnpm install --frozen-lockfile
   pnpm run check
   pnpm run build
   pnpm run preview
   ```

## Codebase conventions

- UI primitives live under `src/components/ui/` (only components in use are kept).
- Portfolio gallery manifest is generated at build time via `scripts/vite-plugin-portfolio-gallery.mjs`.
- `console.error` / `console.warn` are limited to dev error boundaries and optional Firebase fallbacks.
