# Ximing Luo Personal Website

My corner of the internet! 🌱

React + TypeScript portfolio site deployed to GitHub Pages with `gh-pages`.

## Tech Stack

- Create React App (`react-scripts@5`)
- React 19 + TypeScript
- React Router (`react-router-dom@7`)
- Three.js / React Three Fiber
- GSAP (animation)

## Run Commands

- `npm start`: local dev server
- `npm run build`: production build
- `npm run deploy`: publish `build/` to GitHub Pages
- `npm run lint`: run ESLint on `src`
- `npm run lint:fix`: auto fix lint issues where possible
- `npm run format`: run Prettier on source + docs
- `npm run format:check`: verify formatting

## Project Structure

- `src/app/`: route composition and app shell wiring
- `src/pages/`: page modules (`home`, `portfolio`, `creative`, `project-detail`, `not-found`)
- `src/pages/home/`: home page feature modules (sections, hooks, concern hooks, events, 3D scene)
- `src/features/`: feature folders (currently `bunny/` modal + scene system)
- `src/components/`: shared site components and visual primitives
- `src/components/ui/OptimizedImage.tsx`: shared image component
- `src/data/`: content data (`projects/`, `awards`, photos)
- `src/data/projects/content/`: split project content chunks composed into `projects.content.ts`
- `src/hooks/`: reusable cross page hooks (`useViewportSize`, `useMediaQuery`, `useIntersectionOnce`, etc.)
- `src/theme/`: tokenized theme values + visual tokens

## Architecture Notes

- Page specific logic stays with the page (for example `src/pages/home/home.hooks.ts` and `src/pages/home/home.concern.hooks.ts`).
- Cross page hooks live in `src/hooks/`.
- Complex features are grouped in `src/features/` (for example the bunny mini game modal and scene).
- Styling is primarily CSS based, with CSS variables used for theme driven and responsive values.

## Image Workflow

Add originals to `public/images/...` and keep content URLs as `/images/...`. Use `OptimizedImage`
for consistent lazy loading and fetch priority behavior.
