# elite-mob.github.io

Personal portfolio website for Hans Chan, published at [https://elite-mob.github.io](https://elite-mob.github.io).

## Tech Stack

- **Vite** - Build tool
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Client-side routing

## Development

```sh
# Install dependencies (pnpm; see packageManager in package.json)
pnpm install

# Start development server
pnpm run dev
```

The dev server runs at [http://localhost:8080](http://localhost:8080).

## Build

```sh
pnpm run build
```

Output is in the `dist/` folder.

## Deployment

This site is deployed to GitHub Pages via GitHub Actions. Pushing to the `main` branch triggers an automatic build and deployment to [https://elite-mob.github.io](https://elite-mob.github.io).

**GitHub Pages setup (required once):**
1. Repository → [Settings → Pages](https://github.com/elite-mob/elite-mob.github.io/settings/pages)
2. **Build and deployment** → **Source**: **GitHub Actions** (not “Deploy from a branch → main”)

CI builds `dist/` and deploys it via `actions/deploy-pages` on every push to `main`.

**Blank white screen?** View Page Source: if you see `<script src="/src/main.tsx">`, Pages is still serving source files from `main`. Switch the source to **GitHub Actions** as above, then re-run the deploy workflow.
