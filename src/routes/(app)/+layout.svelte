<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";

  let { data, children } = $props();
  const user = $derived(data.user);
  const notificationBadgeCount = $derived(data.notificationBadgeCount);
  const currentPath = $derived($page.url.pathname);

  // Check if current path is home
  const isHomePath = $derived(
    currentPath === "/home" || currentPath === "/home/" || currentPath === "/",
  );

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
    <header
      onclick={handleHeaderClick}
      role="presentation"
      class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 cursor-pointer border-b backdrop-blur"
    >
      <div class="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <a href={resolve("/home")} class="flex items-center gap-2">
          <img src="/favicon.png" alt="Nagi logo" class="h-8 w-8" />
          <span class="font-semibold">Nagi</span>
        </a>
        <div class="flex items-center gap-2">
          <button
            onclick={() => window.location.reload()}
            class="text-muted-foreground hover:text-foreground p-2"
            aria-label="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>
          <a
            href={resolve("/notifications")}
            class="text-muted-foreground hover:text-foreground relative p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {#if notificationBadgeCount > 0}
              <span
                class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white"
              >
                {notificationBadgeCount > 99 ? "99+" : notificationBadgeCount}
              </span>
            {/if}
          </a>
          <button
            onclick={handleLogout}
            class="text-muted-foreground hover:text-foreground p-2"
            aria-label="Sign out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
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
          href={resolve("/home")}
          class="flex flex-col items-center gap-1 {isHomePath
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
          href={resolve("/search")}
          class="flex flex-col items-center gap-1 {currentPath === '/search/'
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span class="text-xs">Search</span>
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
