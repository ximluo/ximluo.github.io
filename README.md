# ximingluo.com

Ximing Luo's portfolio, presented as a film reel: an opening leader, a list of projects down the left, a player
that shows the current one, docked project pages, and a draggable wall of artworks. Live at
[ximingluo.com](https://ximingluo.com).

## Stack

- [Vite](https://vite.dev), [React 19](https://react.dev) and TypeScript in strict mode
- Plain CSS, kept in `src/styles` (the design lives there; nothing is generated)
- WebGL2 for the artwork wall, 2D canvas for the grain and the code-glyph hero
- Self-hosted type: Boska, B612 Mono and League Gothic (licences sit beside the files in `public/media/fonts`)
- No other runtime dependencies

## Scripts

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Development server with hot reload on :5173              |
| `npm run build`     | Type-checks, then builds the site into `dist/`           |
| `npm run preview`   | Serves `dist/` on :4173                                  |
| `npm run typecheck` | `tsc --noEmit`                                           |
| `npm run lint`      | ESLint (TypeScript, React hooks, Prettier compatibility) |
| `npm run format`    | Prettier over the source                                 |

## How it is put together

```
src/
  main.tsx, App.tsx       entry and the page, in the order the stylesheet layers it
  data/                   the content (see below) and the catalogue built from it
  components/             one component per piece of the page; markup only, content from the store
  reel/                   the typed sequences that drive the site: player, project pane, wall, phone sheet,
                          keyboard, startup. They write to one store React renders from and animate the
                          elements the components register.
  film/                   grain, cursor and timecode loop; the leader; the split cut; tweens; the page tint
  wall/                   the WebGL wall and the canvas effects
  styles/                 fonts, project pages, core, layout, wall
public/                   static files served as they are: icons, `404.html`, `echoes.pdf`, `media/`
```

Timing and gestures are deliberate (stepped tweens at film-like frame rates, swipe and wheel thresholds), so
changes to `src/reel` and `src/film` should be checked against the live site at both desktop and phone widths.

## Content

Everything shown comes from `src/data`:

- `work.ts`: the projects. Each entry has an `id`, a `section` (`selected`, `graphics`, `software`,
  `experiments`, `research`), the list `label` and `meta`, `title`, `sub`, `tagline`, `year`, `tags`, optional
  `links`, a `summary`, a `hero` and `thumb`, and the story `blocks`: `{ p }` paragraphs, `{ h }` headings,
  `{ img, w, h, cap }` figures, `{ row: [...] }` images side by side, `{ embed }` video, `{ live, poster }`
  click-to-load demos and `{ link, cap }` documents. Paragraphs accept `[text](url)` links and `**bold**`.
- `art.ts`: the pieces on the wall, in wall order (`photo-N` ids).
- `experience.ts`, `about.ts`: the About page. `recognition.ts`: awards, exhibitions, fellowships; `works`
  links an item to project or piece ids, `top` puts it in Highlights, `early` folds it under Earlier.
- `tints.json`: the average colour of each thumbnail, keyed by its path, for the page light.
- `types.ts` describes all of it, so a typo in an entry fails `npm run build`.

Media paths are relative to `public/media`: project images under `media/img/<project>/`, list thumbnails as
`media/cat/<id>.jpg` (around 520px wide), documents under `media/doc/`. To add a project: write its entry in
`work.ts`, add its images and thumbnail, and add a tint for the thumbnail. To add an artwork: an entry in
`art.ts` with a `hero` and a `thumb`.

`echoes.pdf` stays at the site root on purpose; the address is printed in places.

## Routes

The site is one page and routes by query string:

| URL                        | Opens                                         |
| -------------------------- | --------------------------------------------- |
| `/?open=<id>`              | A project page (`?about`, `?recognition` too) |
| `/?art`                    | The artwork wall                              |
| `/?art=<photo-id>`         | A piece, enlarged over the wall               |
| `/?index` or `/?view=list` | The player with every section unfolded        |
| `/?skipintro`              | Skips the leader (deep links do this anyway)  |
| `/?tint=grey`              | A grey leader                                 |

After the first visit the leader is skipped; the name at the top left replays it.

Links to the previous site (`/portfolio/<id>`, `/creative`, `/about`) are redirected by `public/404.html`,
which GitHub Pages serves for any unknown path.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: it installs, lints, builds and publishes `dist/` to
GitHub Pages, which serves it at ximingluo.com (the custom domain is set in the repository's Pages settings;
`public/CNAME` is kept as a belt and braces). `gh run watch` follows a deploy; the workflow can also be started
by hand from the Actions tab.

## Before 2026

The React site this replaced, its deploy history and the plain-HTML prototype of this design are archived in
`ximluo/portfolio-archive-2025`.
