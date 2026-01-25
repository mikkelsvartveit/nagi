<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";

  let { data, children } = $props();
  const user = $derived(data.user);
  const currentPath = $derived($page.url.pathname);

  // Redirect to login if not authenticated
  $effect(() => {
    if (!user) {
      goto(resolve("/login"));
    }
  });

  const handleLogout = async () => {
    pb.authStore.clear();
    await invalidateAll();
    goto(resolve("/login"));
  };
</script>

{#if user}
  <div class="flex min-h-dvh flex-col">
    <!-- Header -->
    <header
      class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur"
    >
      <div class="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <div
            class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-primary-foreground h-4 w-4"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <span class="font-semibold">Nagi</span>
        </div>
        <Button variant="ghost" size="sm" onclick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="mx-auto max-w-lg px-4 py-8">
        {@render children()}
      </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="bg-background sticky bottom-0 border-t">
      <div class="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        <a
          href={resolve("/")}
          class="flex flex-col items-center gap-1 {currentPath === '/'
            ? 'text-primary'
            : 'text-muted-foreground'}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span class="text-xs">Feed</span>
        </a>
        <a
          href={resolve("/create")}
          class="flex flex-col items-center gap-1 {currentPath === '/create/'
            ? 'text-primary'
            : 'text-muted-foreground'}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
          <span class="text-xs">Create</span>
        </a>
        <a
          href={resolve("/profile")}
          class="flex flex-col items-center gap-1 {currentPath === '/profile/'
            ? 'text-primary'
            : 'text-muted-foreground'}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
          </svg>
          <span class="text-xs">Profile</span>
        </a>
      </div>
    </nav>
  </div>
{/if}
