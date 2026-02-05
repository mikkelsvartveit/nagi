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

  function handleHeaderClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    // Don't scroll if clicking on a button or link
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getAvatarUrl() {
    if (!user?.avatar) return null;
    return pb.files.getURL(user, user.avatar, { thumb: "100x100" });
  }
</script>

{#if user}
  <div class="flex min-h-dvh flex-col">
    <!-- Header -->
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <header
      onclick={handleHeaderClick}
      class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 cursor-pointer border-b backdrop-blur"
    >
      <div class="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <img src="/favicon.png" alt="Nagi logo" class="h-8 w-8" />
          <span class="font-semibold">Nagi</span>
        </div>
        <Button variant="ghost" size="sm" onclick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="mx-auto max-w-lg px-4 pt-3 pb-12">
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
          {#if getAvatarUrl()}
            <img
              src={getAvatarUrl()}
              alt="Profile"
              class="h-6 w-6 rounded-full object-cover {currentPath ===
              '/profile/'
                ? 'ring-primary ring-2'
                : ''}"
            />
          {:else}
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
          {/if}
          <span class="text-xs">Profile</span>
        </a>
      </div>
    </nav>
  </div>
{/if}
