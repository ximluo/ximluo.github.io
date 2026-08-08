# Ximing Luo Portfolio

My corner of the internet! 🌱

Personal portfolio built with React, TypeScript, and Three.js. The site is deployed to GitHub Pages with `gh-pages`.

## Stack

- Create React App / `react-scripts`
- React 19 + TypeScript
- React Router
- Three.js, React Three Fiber, and Drei
- GSAP for the bunny scene animation
- Plain CSS per page (namespaced by prefix) plus shared card styles, with theme tokens in TypeScript

## Images

Every image is served as pre-generated AVIF/WebP variants from `public/optimized/images/`. GIFs get a still poster plus animated WebP tiers, so no page ships a raw GIF.

- `scripts/generate-image-manifest.js` scans the variants and records widths and intrinsic dimensions into `src/generated/imageManifest.json`
- The manifest regenerates automatically before `start` and `build` (or run `npm run generate:images`)
- `src/components/ui/OptimizedImage.tsx` reads the manifest and renders `<picture>`/`srcSet` markup, falling back to the original file for anything without variants

## Commands

- `npm start`: run the local development server
- `npm run build`: create a production build in `build/`
- `npm run deploy`: publish `build/` to GitHub Pages
- `npm run generate:images`: regenerate the optimized image manifest
- `npm run lint`: run ESLint on `src`
- `npm run lint:fix`: run ESLint with autofix
- `npm run format`: format source and root JSON/Markdown files
- `npm run format:check`: check formatting without writing changes

## Important Files

- `src/App.tsx`: app shell, nav, theme setup, scroll reset, and route outlet
- `src/app/routes.tsx`: route definitions
- `src/pages/home/`: home page, featured grids, 3D flower layer, and home-specific hooks
- `src/pages/home/homeFlowerControls.ts`: all home flower model camera, scale, rotation, and layout controls
- `src/pages/portfolio/`: work grid page
- `src/pages/creative/`: art grid page and artwork modal
- `src/pages/project-detail/`: project detail layout, embeds, progressive detail images, and link parsing
- `src/pages/about/`: about page layout
- `src/features/bunny/`: bunny modal and runtime scene logic
- `src/components/`: shared site components such as the footer, dog companion, gradient background, and image wrapper
- `src/components/ui/card.css`: card styles shared by the home, work, and art grids
- `src/hooks/`: viewport, media query, intersection, modal accessibility, and page title hooks
- `scripts/generate-image-manifest.js`: image variant manifest generator
