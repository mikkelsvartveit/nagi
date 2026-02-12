<script lang="ts">
  import { goto } from "$app/navigation";
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

  function getAvatarUrl() {
    if (!user?.avatar) return null;
    return pb.files.getURL(user, user.avatar, { thumb: "100x100" });
  }
</script>

{#if user}
  <div class="flex min-h-dvh flex-col">
    <!-- Main Content -->
    <main class="flex-1">
      <div class="mx-auto max-w-lg px-4 pb-12">
        {@render children()}
      </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="bg-background sticky bottom-0 border-t">
      <div class="mx-auto flex h-16 max-w-lg items-center justify-around">
        <a
          href={resolve("/home")}
          class="flex flex-1 flex-col items-center gap-1 {isHomePath
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
          class="flex flex-1 flex-col items-center gap-1 {currentPath ===
          '/search/'
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
          class="flex flex-1 flex-col items-center gap-1 {currentPath ===
          '/create/'
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
          href={resolve("/activity")}
          class="flex flex-1 flex-col items-center gap-1 {currentPath ===
          '/activity/'
            ? 'text-primary'
            : 'text-muted-foreground'}"
        >
          <div class="relative">
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
          </div>
          <span class="text-xs">Activity</span>
        </a>
        <a
          href={resolve("/profile")}
          class="flex flex-1 flex-col items-center gap-1 {currentPath ===
          '/profile/'
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
