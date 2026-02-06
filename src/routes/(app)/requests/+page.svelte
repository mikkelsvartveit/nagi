<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import { SvelteSet } from "svelte/reactivity";
  import type { FollowsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  type FollowWithUser = FollowsResponse<{ follower: UsersResponse }>;

  let { data } = $props();
  const pendingRequests = $derived(data.pendingRequests as FollowWithUser[]);
  const initialFollowingIds = $derived(data.followingIds as string[]);

  const processingIds = new SvelteSet<string>();

  // Track accepted requests so we can show them with a "Follow back" button
  let acceptedRequests = $state<FollowWithUser[]>([]);
  // Track declined request IDs so we can hide them
  const declinedIds = new SvelteSet<string>();
  // Track users we've followed back (for optimistic UI)
  let followedBackIds = $state<string[]>([]);
  let loadingFollowBack = $state<string | null>(null);

  function getAvatarUrl(user: UsersResponse) {
    if (!user.avatar) return null;
    return pb.files.getURL(user, user.avatar, { thumb: "100x100" });
  }

  function isFollowing(userId: string) {
    return (
      initialFollowingIds.includes(userId) || followedBackIds.includes(userId)
    );
  }

  async function handleAccept(request: FollowWithUser) {
    processingIds.add(request.id);

    try {
      await pb.collection("follows").update(request.id, { accepted: true });
      acceptedRequests = [...acceptedRequests, request];
      await invalidateAll();
    } catch (error) {
      console.error("Failed to accept follow request:", error);
    } finally {
      processingIds.delete(request.id);
    }
  }

  async function handleDecline(request: FollowWithUser) {
    processingIds.add(request.id);

    try {
      await pb.collection("follows").delete(request.id);
      declinedIds.add(request.id);
      await invalidateAll();
    } catch (error) {
      console.error("Failed to decline follow request:", error);
    } finally {
      processingIds.delete(request.id);
    }
  }

  async function handleFollowBack(userId: string) {
    const currentUser = pb.authStore.model;
    if (!currentUser) return;

    loadingFollowBack = userId;
    try {
      const targetUser = await pb
        .collection("users")
        .getOne<UsersResponse>(userId);

      await pb.collection("follows").create({
        follower: currentUser.id,
        following: userId,
        accepted: targetUser.isPublic ? true : false,
      });

      followedBackIds = [...followedBackIds, userId];
      await invalidateAll();
    } catch (error) {
      console.error("Failed to follow back:", error);
    } finally {
      loadingFollowBack = null;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Combine pending and accepted requests, filtering out declined ones
  const allRequests = $derived(() => {
    const acceptedIds = new Set(acceptedRequests.map((r) => r.id));
    const pending = pendingRequests.filter(
      (r) => !declinedIds.has(r.id) && !acceptedIds.has(r.id),
    );
    return [...pending, ...acceptedRequests];
  });
</script>

<div class="pt-6">
  <h1 class="mb-6 text-xl font-semibold">Follow Requests</h1>

  {#if allRequests().length === 0}
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
          <line x1="19" x2="19" y1="8" y2="14" />
          <line x1="22" x2="16" y1="11" y2="11" />
        </svg>
      </div>
      <h2 class="font-medium">No pending requests</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        When people request to follow you, they'll appear here
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each allRequests() as request (request.id)}
        {@const follower = request.expand?.follower}
        {@const isAccepted = acceptedRequests.some((r) => r.id === request.id)}
        {#if follower}
          <div class="bg-card flex items-center gap-3 rounded-xl border p-4">
            <a
              href={resolve(`/user/${follower.username}`)}
              class="bg-muted flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
            >
              {#if getAvatarUrl(follower)}
                <img
                  src={getAvatarUrl(follower)}
                  alt={follower.username}
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
            </a>

            <div class="min-w-0 flex-1">
              <a
                href={resolve(`/user/${follower.username}`)}
                class="block truncate font-medium hover:underline"
              >
                {follower.name || "@" + follower.username}
              </a>
              <p class="text-muted-foreground truncate text-sm">
                {follower.name ? "@" + follower.username : ""} · {formatDate(
                  request.created,
                )}
              </p>
            </div>

            <div class="flex flex-shrink-0 gap-2">
              {#if isAccepted}
                {#if !isFollowing(follower.id)}
                  <Button
                    size="sm"
                    onclick={() => handleFollowBack(follower.id)}
                    disabled={loadingFollowBack === follower.id}
                  >
                    {#if loadingFollowBack === follower.id}
                      Following...
                    {:else}
                      Follow back
                    {/if}
                  </Button>
                {:else}
                  <span class="text-muted-foreground text-sm">Following</span>
                {/if}
              {:else}
                <Button
                  size="sm"
                  onclick={() => handleAccept(request)}
                  disabled={processingIds.has(request.id)}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => handleDecline(request)}
                  disabled={processingIds.has(request.id)}
                >
                  Decline
                </Button>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
