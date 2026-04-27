# Ximing Luo Portfolio

My corner of the internet! 🌱

Personal portfolio built with React, TypeScript, and Three.js. The site is deployed to GitHub Pages with `gh-pages`.

## Stack

- Create React App / `react-scripts`
- React 19 + TypeScript
- React Router
- Three.js, React Three Fiber, and Drei
- GSAP for the bunny scene animation
- CSS modules by page, with shared theme tokens in TypeScript

## Commands

- `npm start`: run the local development server
- `npm run build`: create a production build in `build/`
- `npm run deploy`: publish `build/` to GitHub Pages
- `npm run lint`: run ESLint on `src`
- `npm run lint:fix`: run ESLint with autofix
- `npm run format`: format source, docs, and root JSON/Markdown files
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
- `src/hooks/`: reusable viewport, media query, and intersection hooks