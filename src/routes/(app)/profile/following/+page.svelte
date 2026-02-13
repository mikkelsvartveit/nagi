<script lang="ts">
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import type { FollowsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  type FollowWithUser = FollowsResponse<{ following: UsersResponse }>;

  let { data } = $props();
  const following = $derived(data.following as FollowWithUser[]);

  function getAvatarUrl(user: UsersResponse) {
    if (!user?.avatar) return null;
    return pb.files.getURL(user, user.avatar, { thumb: "100x100" });
  }
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
          <a
            href={resolve(`/u/${followingUser.username}`)}
            class="bg-card flex items-center gap-3 rounded-xl border p-4"
          >
            <div
              class="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
            >
              {#if getAvatarUrl(followingUser)}
                <img
                  src={getAvatarUrl(followingUser)}
                  alt={followingUser.username}
                  class="h-full w-full object-cover"
                />
              {:else}
                <span class="icon-[lucide--user] text-muted-foreground h-5 w-5"
                ></span>
              {/if}
            </div>
            <div class="min-w-0">
              <p class="truncate font-medium">
                {followingUser.name || "@" + followingUser.username}
              </p>
              {#if followingUser.name}
                <p class="text-muted-foreground truncate text-sm">
                  @{followingUser.username}
                </p>
              {/if}
            </div>
          </a>
        {/if}
      {/each}
    </div>
  {/if}
</div>
