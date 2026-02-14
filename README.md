Personal Website

## Structure
- `src/app/`: app-level route composition (`routes.tsx`) with lazy-loaded pages.
- `src/pages/`: page folders with colocated implementations/styles:
  `home/`, `portfolio/`, `creative/`, `project-detail/`, `not-found/`.
- `src/components/`: shared UI and visual components.
- `src/features/`: feature-isolated code that is loaded on demand (`features/bunny`).
- `src/theme/`: centralized theme token maps.
- `src/hooks/`: reusable hooks (`useMediaQuery`, `useIsMobile`).
- `src/utils/`: framework-agnostic helpers (`scramble`).

## Conventions
- Keep visuals and behavior unchanged during refactors unless explicitly requested.
- Prefer shared tokens/hooks/utils over redefining logic inside pages.
- Lazy-load heavy routes/features to reduce initial bundle size.
- Keep page-specific logic in pages, cross-cutting behavior in hooks/utils/theme.
