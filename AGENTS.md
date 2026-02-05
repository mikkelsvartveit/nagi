# AGENTS.md - Coding Agent Instructions

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

**Tech stack:** TypeScript + SvelteKit 2 (SPA mode) + Svelte 5 + PocketBase + Tailwind CSS v4 + shadcn-svelte
**Package Manager:** pnpm (required)

## Development Commands

```bash
pnpm run dev # Run SvelteKit + PocketBase simultaneously
pnpm run check # Run type checker
pnpm run lint # Prettier check + ESLint
pnpm run format # Format with Prettier
pnpm run typegen # Regenerate PocketBase types from database
```

Assume the dev server is already running. Only start it yourself if you can't access it.

## Project Structure

```
src/
├── app.html                    # HTML template
├── app.css                     # Global CSS with Tailwind + shadcn theme
├── app.d.ts                    # SvelteKit type declarations
├── lib/
│   ├── pocketbase.ts           # PocketBase client singleton (typed)
│   ├── pocketbase-typegen.ts   # Auto-generated types (DO NOT EDIT)
│   ├── utils.ts                # Utility functions (cn() helper)
│   └── components/
│       └── ui/                 # shadcn-svelte UI components
└── routes/                     # SvelteKit routes
```

## Development Guidelines

- Always use Svelte 5 Runes syntax
- SvelteKit is running in SPA mode. Never use server-side features of SvelteKit.
- Use shadcn-svelte for UI components. You can install new components with `pnpm dlx shadcn-svelte@latest add <component>`
- Use the `$lib` alias for all local imports
- Don't write PocketBase migrations manually. Instead, provide instructions for what I need to change in the PocketBase UI, including API rules/permissions.
- PocketBase types are auto-generated - run `pnpm run typegen` after schema changes
- Before finishing a task, always run `pnpm run format && pnpm run check && pnpm run lint` to check for issues.

## MCP Servers

You may be able to use the following MCP servers. If you can access them, here is how they should be used.

### context7

For looking up documentation for frameworks and libraries. Always use this when working with frameworks and libraries to make sure to have the latest documentation.

### Chrome DevTools MCP

For controlling the Chrome browser. When working with UI, you can use this to test your work in the browser before finishing the task. Also use the take_screenshot tool to verify the visual design of your work. If you find design issues, improve it before finishing the task. ONLY use this MCP server if explicitly instructed to do it.

### Svelte MCP server

Access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

#### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

#### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

#### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

#### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
