# 2048

A clean, responsive 2048 clone built with Vite + React + TypeScript.

**Play:** https://abhi1kush.github.io/2048/

## Controls
- Arrow keys or WASD on desktop
- Swipe on touch devices

Merge tiles to reach 2048; you can keep playing afterwards. Best score is saved in localStorage.

## Development
```bash
npm install
npm run dev      # start dev server
npm test         # run Vitest unit tests (src/game.test.ts)
npm run build    # production build into dist/
npm run preview  # preview the build
```

Game logic is pure and lives in `src/game.ts`.

## Deploy
GitHub Pages serves the `gh-pages` branch. To publish, run:
```bash
npm run deploy   # runs scripts/deploy.sh: npm ci, build, force-push dist/ (+ .nojekyll) to gh-pages
```
