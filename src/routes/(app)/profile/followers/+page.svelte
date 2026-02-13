<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import UserListItem from "$lib/components/UserListItem.svelte";
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
        <span class="icon-[lucide--users] text-muted-foreground h-6 w-6"></span>
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
            <UserListItem user={followerUser} className="flex-1" />
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
