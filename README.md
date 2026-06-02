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
# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server runs at [http://localhost:8080](http://localhost:8080).

## Build

```sh
npm run build
```

Output is in the `dist/` folder.

## Deployment

This site is deployed to GitHub Pages via GitHub Actions. Pushing to the `main` branch triggers an automatic build and deployment to [https://elite-mob.github.io](https://elite-mob.github.io).

**GitHub Pages setup:**
1. Go to Repository → Settings → Pages
2. Under "Build and deployment", set Source to **GitHub Actions** (not “Deploy from a branch”)

**Blank white screen?** The live `index.html` must load hashed files under `/assets/`, not `/src/main.tsx`. That happens when Pages serves the repo root instead of the built `dist/` from Actions. Fix: set Source to **GitHub Actions**, push to `main`, and confirm the [Deploy workflow](.github/workflows/deploy.yml) succeeds.
