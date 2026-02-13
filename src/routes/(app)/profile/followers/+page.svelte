<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import type { FollowsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  type FollowWithUser = FollowsResponse<{ follower: UsersResponse }>;

  let { data } = $props();
  const followers = $derived(data.followers as FollowWithUser[]);
  const initialFollowingIds = $derived(data.followingIds as string[]);
  const pendingFollowingIds = $derived(data.pendingFollowingIds as string[]);

  // Track locally added follows (for optimistic UI update)
  let addedFollowIds = $state<string[]>([]);

  let loadingFollow = $state<string | null>(null);

  function getAvatarUrl(user: UsersResponse) {
    if (!user?.avatar) return null;
    return pb.files.getURL(user, user.avatar, { thumb: "100x100" });
  }

  function isFollowing(userId: string) {
    return (
      initialFollowingIds.includes(userId) || addedFollowIds.includes(userId)
    );
  }

  function isPendingRequest(userId: string) {
    return pendingFollowingIds.includes(userId);
  }

  async function handleFollowBack(userId: string) {
    const currentUser = pb.authStore.model;
    if (!currentUser) return;

    loadingFollow = userId;
    try {
      // Check if this user has a public profile
      const targetUser = await pb
        .collection("users")
        .getOne<UsersResponse>(userId);

      await pb.collection("follows").create({
        follower: currentUser.id,
        following: userId,
        accepted: targetUser.isPublic ? true : false,
      });

      addedFollowIds = [...addedFollowIds, userId];
      await invalidateAll();
    } catch (error) {
      console.error("Failed to follow back:", error);
    } finally {
      loadingFollow = null;
    }
  }
</script>

<div class="py-6">
  <h1 class="mb-6 text-xl font-semibold">Followers</h1>

  {#if followers.length === 0}
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      </div>
      <h2 class="font-medium">No followers yet</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        When people follow you, they'll appear here
      </p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each followers as follow (follow.id)}
        {@const followerUser = follow.expand?.follower}
        {#if followerUser}
          <div
            class="bg-card flex items-center justify-between rounded-xl border p-4"
          >
            <a
              href={resolve(`/u/${followerUser.username}`)}
              class="flex min-w-0 flex-1 items-center gap-3"
            >
              <div
                class="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
              >
                {#if getAvatarUrl(followerUser)}
                  <img
                    src={getAvatarUrl(followerUser)}
                    alt={followerUser.username}
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
              <div class="min-w-0">
                <p class="truncate font-medium">
                  {followerUser.name || "@" + followerUser.username}
                </p>
                {#if followerUser.name}
                  <p class="text-muted-foreground truncate text-sm">
                    @{followerUser.username}
                  </p>
                {/if}
              </div>
            </a>
            {#if !isFollowing(followerUser.id)}
              {#if isPendingRequest(followerUser.id)}
                <span class="text-muted-foreground text-sm">Requested</span>
              {:else}
                <Button
                  size="sm"
                  onclick={() => handleFollowBack(followerUser.id)}
                  disabled={loadingFollow === followerUser.id}
                >
                  {#if loadingFollow === followerUser.id}
                    Following...
                  {:else}
                    Follow back
                  {/if}
                </Button>
              {/if}
            {:else}
              <span class="text-muted-foreground text-sm">Following</span>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
