# Invoice

This repository contains a Vite + Vue 3 invoice generator web app.

Deployment

- This project is configured to deploy to GitHub Pages via GitHub Actions.
- When you push to the `main` branch, the workflow builds the site and uploads the `dist` artifact for Pages to deploy.
- The site will be available at: https://<your-username>.github.io/invoice/ (replace `<your-username>` with `Abdullah101197`).

Local development

Install dependencies and run dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Notes

- `vite.config.js` uses a relative `base: "./"` so the built site works when served from a subpath (GitHub Pages repository site).
- If you want a custom domain, add a `CNAME` file to the `public/` folder or create `CNAME` at the repo root in the `gh-pages` branch.
