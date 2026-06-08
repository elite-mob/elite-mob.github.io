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

On Windows, if `pnpm install` fails with `EPERM` on `@esbuild` or `@swc` (often after mixing npm and pnpm), remove `node_modules` and reinstall with one package manager only:

```sh
Remove-Item -Recurse -Force node_modules
pnpm install
# or: npm install --legacy-peer-deps && npm run dev
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
2. **Build and deployment** → **Source**: pick **one** of these (not `main` branch):
   - **GitHub Actions**, or
   - **Deploy from a branch** → **`gh-pages`** / **/(root)**

CI builds `dist/`, pushes it to `gh-pages`, and uploads a Pages artifact on every push to `main`.

**Blank screen?** View Page Source: if you see `<script src="/src/main.tsx">`, Pages is still serving source from `main`. Change the source as above, then re-run the deploy workflow.
