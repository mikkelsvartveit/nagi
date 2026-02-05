<script lang="ts">
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import type { UsersResponse } from "$lib/pocketbase-typegen";

  let query = $state("");
  let results = $state<UsersResponse[]>([]);
  let loading = $state(false);
  let hasSearched = $state(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function getAvatarUrl(user: UsersResponse) {
    if (!user.avatar) return null;
    return pb.files.getURL(user, user.avatar, { thumb: "100x100" });
  }

  async function searchUsers() {
    const searchQuery = query.trim();
    if (!searchQuery) {
      results = [];
      hasSearched = false;
      return;
    }

    loading = true;
    hasSearched = true;

    try {
      const searchResults = await pb
        .collection("users")
        .getList<UsersResponse>(1, 20, {
          filter: `username ~ "${searchQuery}" || name ~ "${searchQuery}"`,
          sort: "username",
        });
      results = searchResults.items;
    } catch (error) {
      console.error("Search failed:", error);
      results = [];
    } finally {
      loading = false;
    }
  }

  function handleInput() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      searchUsers();
    }, 300);
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    searchUsers();
  }
</script>

<div class="pt-6">
  <h1 class="mb-6 text-xl font-semibold">Search Users</h1>

  <form onsubmit={handleSubmit} class="mb-6">
    <div class="flex gap-2">
      <Input
        type="search"
        placeholder="Search by username or name..."
        bind:value={query}
        oninput={handleInput}
        class="flex-1"
      />
      <Button type="submit" disabled={loading}>
        {#if loading}
          <svg
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        {:else}
          Search
        {/if}
      </Button>
    </div>
  </form>

  {#if hasSearched && results.length === 0 && !loading}
    <div class="bg-card rounded-xl border p-8 text-center">
      <div
        class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-muted-foreground h-6 w-6"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <h2 class="font-medium">No users found</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        Try searching with a different term
      </p>
    </div>
  {:else if results.length > 0}
    <div class="space-y-2">
      {#each results as user (user.id)}
        <a
          href={resolve(`/user/${user.username}`)}
          class="bg-card hover:bg-accent flex items-center gap-3 rounded-xl border p-4 transition-colors"
        >
          <div
            class="bg-muted flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
          >
            {#if getAvatarUrl(user)}
              <img
                src={getAvatarUrl(user)}
                alt={user.username}
                class="h-full w-full object-cover"
              />
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-muted-foreground h-5 w-5"
              >
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            {/if}
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">
              {user.name || "@" + user.username}
            </p>
            <p class="text-muted-foreground truncate text-sm">
              {user.name ? "@" + user.username : ""}
            </p>
          </div>

          {#if user.isPublic}
            <span
              class="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
            >
              Public
            </span>
          {/if}
        </a>
      {/each}
    </div>
  {:else if !hasSearched}
    <div class="text-muted-foreground text-center text-sm">
      Start typing to search for users
    </div>
  {/if}
</div>
