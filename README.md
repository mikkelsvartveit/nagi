# Nagi

A mobile-first photo-sharing social media app built with SvelteKit and PocketBase.

## Features

- Create posts with up to 10 images, a caption, and a location
- Image carousel with swipe navigation and dot indicators
- Like posts (with double-tap heart animation)
- Follow/unfollow users — private accounts require approval
- Activity feed for likes and follow requests/notifications
- Search users by username or name
- User profiles with followers/following lists

## Tech stack

- [SvelteKit](https://kit.svelte.dev) (SPA mode) + [Svelte 5](https://svelte.dev) Runes
- [PocketBase](https://pocketbase.io) — backend, database, file storage, and auth
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn-svelte](https://www.shadcn-svelte.com/)
- [TypeScript](https://www.typescriptlang.org)
- [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen) for auto-generated types

## Getting started

1. Install dependencies and the PocketBase binary:

   ```bash
   pnpm install
   pnpm run install:pocketbase
   ```

2. Start the dev server (SvelteKit + PocketBase run in parallel):

   ```bash
   pnpm run dev
   ```

The app is available at `http://localhost:5173` and the PocketBase admin panel at `http://localhost:8090/_/`.

## Other commands

```bash
pnpm run check     # TypeScript type check
pnpm run lint      # Prettier + ESLint
pnpm run format    # Auto-format with Prettier
pnpm run typegen   # Regenerate PocketBase types (run after schema changes)
```

## Deployment

The project includes a Dockerfile that builds the SvelteKit app and serves it through PocketBase on port 8080. Mount a volume to `/pb/pb_data` to persist data.
