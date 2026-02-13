<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { resolve } from "$app/paths";
  import { getUserAvatarUrl } from "$lib/pocketbase-media";
  import type { UsersResponse } from "$lib/pocketbase-typegen";

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

  const avatarUrl = $derived(getUserAvatarUrl(user as UsersResponse | null));
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
          <span class="icon-[lucide--home] inline-block h-6 w-6 shrink-0"
          ></span>
          <span class="text-xs">Feed</span>
        </a>
        <a
          href={resolve("/search")}
          class="flex flex-1 flex-col items-center gap-1 {currentPath ===
          '/search/'
            ? 'text-primary'
            : 'text-muted-foreground'}"
        >
          <span class="icon-[lucide--search] inline-block h-6 w-6 shrink-0"
          ></span>
          <span class="text-xs">Search</span>
        </a>
        <a
          href={resolve("/create")}
          class="flex flex-1 flex-col items-center gap-1 {currentPath ===
          '/create/'
            ? 'text-primary'
            : 'text-muted-foreground'}"
        >
          <span class="icon-[lucide--square-plus] inline-block h-6 w-6 shrink-0"
          ></span>
          <span class="text-xs">Create</span>
        </a>
        <a
          href={resolve("/activity")}
          class="flex flex-1 flex-col items-center gap-1 {currentPath ===
          '/activity/'
            ? 'text-primary'
            : 'text-muted-foreground'}"
        >
          <div class="relative h-6 w-6 shrink-0">
            <span class="icon-[lucide--bell] inline-block h-6 w-6"></span>
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
          {#if avatarUrl}
            <img
              src={avatarUrl}
              alt="Profile"
              class="h-6 w-6 rounded-full object-cover {currentPath ===
              '/profile/'
                ? 'ring-primary ring-2'
                : ''}"
            />
          {:else}
            <span
              class="icon-[lucide--circle-user] inline-block h-6 w-6 shrink-0"
            ></span>
          {/if}
          <span class="text-xs">Profile</span>
        </a>
      </div>
    </nav>
  </div>
{/if}
