# Divergify Core

The official codebase for the Divergify platform, Sidekick app, and brand assets.

## Netlify Landing Page

The production landing page lives at **https://divergify-lp.netlify.app**. The static assets that power that site are committed to this repo under [`web/public`](web/public).

Deploying this repository to Netlify with the following settings guarantees you are pushing updates to the correct project:

- **Base directory:** (leave blank)
- **Build command:** (leave blank)
- **Publish directory:** `web/public`

A `netlify.toml` file in the repo root mirrors these settings so they are tracked in version control.

## Local preview

You can serve the static landing page locally with any HTTP server. For example:

```bash
npx serve web/public
```

Then open http://localhost:3000 (or the port reported by your server) to preview the site before deploying.
