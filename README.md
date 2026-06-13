# paperless-ui

A modern, standalone UI for [paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) built with SvelteKit and Tailwind CSS.

The existing paperless-ngx frontend gets the job done, but felt dated. This project is a clean replacement that talks directly to the paperless REST API — all backend logic, document processing, automations, and user management stay in paperless-ngx untouched.

## Features

- **Document grid** with thumbnail previews, tag pills (with their paperless colors), and metadata
- **Infinite scroll** — loads documents in batches of 50 as you scroll
- **Per-card metadata** — correspondent, document type, issue date, and owner (shown with icons)
- **Standalone** — no changes to your paperless-ngx instance required
- **Docker-ready** — builds to a static bundle, deployable behind nginx

## Stack

- [SvelteKit](https://kit.svelte.dev) — framework and routing
- [Tailwind CSS](https://tailwindcss.com) — styling
- [paperless-ngx REST API](https://docs.paperless-ngx.com/api/) — all data

## Getting started

### Prerequisites

- A running [paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) instance
- Node.js 18+

### Setup

```bash
# install dependencies
npm install

# copy and fill in your paperless connection details
cp .env.example .env
```

**.env**
```
VITE_PAPERLESS_URL=http://your-paperless-host:8000
VITE_PAPERLESS_TOKEN=your-api-token
```

You can find your API token in paperless under **Settings → API Token**.

```bash
# start the dev server
npm run dev
```

The app is available at `http://localhost:5173`. In development, API requests are proxied through Vite to avoid CORS issues.

### Production build

```bash
npm run build
```

This outputs a static bundle to `build/`. Serve it with any static file server, e.g. nginx.

### Docker

Coming soon — the static adapter is already configured, so a simple `nginx:alpine` Dockerfile is all that's needed.

## Architecture

```
paperless-ui  ←→  paperless-ngx REST API  ←→  paperless-ngx backend
(this repo)                                     (unchanged)
```

paperless-ui is purely a frontend. It does not store any data, manage users, or run background jobs — that all stays in paperless-ngx.

### Source structure

```
src/
  lib/
    api/
      client.ts          # fetch base, auth header, blob helper
      documents.ts       # document list, detail, thumbnail, download URLs
      tags.ts
      correspondents.ts
      document_types.ts
      users.ts
      index.ts           # re-exports everything
    components/
      Sidebar.svelte
      DocumentCard.svelte
      DocumentList.svelte
      DocumentDetail.svelte
    types.ts             # shared TypeScript interfaces
  routes/
    +layout.svelte       # app shell with sidebar
    +page.svelte         # document grid with infinite scroll
```

## License

MIT
