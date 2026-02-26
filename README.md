# Ximing Luo Personal Website

React + TypeScript portfolio deployed to GitHub Pages with `gh-pages`.

## Tech Stack

- Create React App (`react-scripts@5`)
- React 19 + TypeScript
- React Router
- Three.js / React Three Fiber

## Run Commands

- `npm start`: local dev server
- `npm run optimize-images`: generate optimized image variants + manifests
- `npm run build`: production build (runs image optimization first)
- `npm run deploy`: publish `build/` to GitHub Pages

## Project Structure

- `src/app/`: route composition and app-level wiring
- `src/pages/`: page modules (`home`, `portfolio`, `creative`, `project-detail`, `not-found`)
- `src/components/`: shared UI and site components
- `src/components/ui/OptimizedImage.tsx`: shared responsive image component
- `src/data/`: project and artwork content
- `src/theme/`: tokenized theme values
- `scripts/optimize-images.js`: build-time image optimizer
- `public/optimized/images/`: generated responsive assets
- `src/generated/imageManifest.json`: runtime manifest consumed by `OptimizedImage`

## Image Performance Workflow

1. Add originals to `public/images/...` and keep URLs in content as `/images/...`.
2. Run `npm run optimize-images` (or just `npm run build`).
3. Use `OptimizedImage` for image rendering to reuse `srcSet`, intrinsic dimensions, lazy-loading.
4. For heavy GIF thumbnails in card grids, set `preferPosterForGif` to use generated lightweight posters.
