# Repository Guidelines

## Project Structure & Module Organization
Gameplay UI lives in `src/components` (board, controls, status panels), with shared logic in `src/hooks` (`useGameLogic`, `useFirebaseGame`) and Firebase bootstrapping inside `src/lib/firebase.js`. `App.jsx` and `main.jsx` compose the app shell, while Tailwind globals stay in `src/index.css`. Static art, icons, and manifest files belong in `public/`, and deploy configs (`firebase.json`, `database.rules.json`, `netlify.toml`, `tailwind.config.js`, `vite.config.js`) remain at the repo root for quick audits.

## Build, Test & Development Commands
- `npm install`: install or refresh dependencies.
- `npm run dev`: Vite dev server with hot reload at `http://localhost:5173`.
- `npm run build`: optimized bundle in `dist/`; run before Netlify or tag pushes.
- `npm run preview`: serve the built bundle locally to mimic Netlify.
- `firebase deploy --only database`: publish rule updates from `database.rules.json`.

## Coding Style & Naming Conventions
Favor React function components with hooks, 2-space indentation, `const`/`let`, and ESLint-safe modern syntax. Files and components use `PascalCase` (`GameBoard.jsx`), hooks begin with `use`, and helpers stay in `camelCase`. Keep Tailwind classes close to the markup; when utilities repeat, lift them into small wrapper components instead of ad-hoc CSS. Store Firebase refs, Netlify env keys, and magic numbers in descriptively named constants.

## Testing Guidelines
Automated tests have not been committed yet; new features should introduce Vitest + React Testing Library suites under `src/__tests__` or next to components as `<Component>.test.jsx`. Name cases after the behavior (`OnlineGame.syncsRemoteTurns`) and cover dice-roll state machines plus Firebase sync helpers first. Add a `test` script that runs `vitest run --coverage` so contributors can execute it locally, and call out any Firebase emulator needs inside the PR.

## Commit & Pull Request Guidelines
Use Conventional Commits (`type(scope): summary`) written in the imperative, e.g., `feat(board): add alien trap animation`. Keep subjects terse and add a short body describing *why* whenever gameplay math, Firebase rules, or Netlify config changes. Pull requests must supply a clear summary, testing evidence (`npm run build`, manual steps, screenshots for UI updates), linked issues, and any environment changes (new `VITE_FIREBASE_*` keys, rule updates). Highlight breaking gameplay or schema changes in the description header.

## Security & Configuration Tips
Never commit `.env`; required `VITE_FIREBASE_*` keys already live in `README.md`/`SETUP.md`. After changing `database.rules.json`, run Firebase’s rule simulator locally before `firebase deploy`. Treat Netlify deploy previews as public and avoid real room codes in screenshots. New scripts under `server/` must read secrets from environment variables (`process.env`) so the repository stays credential-free.
