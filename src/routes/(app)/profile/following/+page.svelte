<script lang="ts">
  import UserListItem from "$lib/components/UserListItem.svelte";
  import type { FollowsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  type FollowWithUser = FollowsResponse<{ following: UsersResponse }>;

  let { data } = $props();
  const following = $derived(data.following as FollowWithUser[]);
</script>

<div class="py-6">
  <h1 class="mb-6 text-xl font-semibold">Following</h1>

  {#if following.length === 0}
    <div class="bg-card rounded-xl border p-8 text-center">
      <div
        class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
      >
        <span class="icon-[lucide--users] text-muted-foreground h-6 w-6"></span>
      </div>
      <h2 class="font-medium">Not following anyone yet</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        When you follow people, they'll appear here
      </p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each following as follow (follow.id)}
        {@const followingUser = follow.expand?.following}
        {#if followingUser}
          <UserListItem
            user={followingUser}
            className="bg-card rounded-xl border p-4"
          />
        {/if}
      {/each}
    </div>
  {/if}
</div>
