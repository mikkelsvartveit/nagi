# Svelte + PocketBase template app

This is a starter project for building web applications with [Svelte](https://svelte.dev) and [PocketBase](https://pocketbase.io).

The project comes with the following libraries and tools preconfigured:

- [TypeScript](https://www.typescriptlang.org)
- [SvelteKit](https://kit.svelte.dev) (in SPA mode)
- [PocketBase](https://pocketbase.io) as a backend
- [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen) for automatic type generation
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn-svelte](https://www.shadcn-svelte.com/) (UI component library)
- [Prettier](https://prettier.io)
- [ESLint](https://eslint.org)
- [Docker](https://www.docker.com) (for easy deployment)

## Getting started

1. Clone the repository

   ```bash
   git clone https://github.com/mikkelsvartveit/svelte-pocketbase-template.git
   ```

2. Install dependencies:

   ```bash
   npm install -g pnpm
   pnpm install
   pnpm install:pocketbase
   ```

3. Run PocketBase and the SvelteKit development server:

   ```bash
   pnpm run dev
   ```

You can now access the app at `http://localhost:5173` and the PocketBase admin panel at `http://localhost:8090/_`.

## Deployment

The project comes with a Dockerfile, which can be used to build and deploy the app on any platform (I personally use [Railway](https://railway.app)).

The Dockerfile builds the SvelteKit app, and then copies the build files to `/pb/pb_public` in order to serve it through PocketBase.

Make sure to mount a volume to the `/pb/pb_data` directory to persist PocketBase data.
