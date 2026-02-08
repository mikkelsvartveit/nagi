<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import { SvelteSet } from "svelte/reactivity";
  import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";
  import type { FollowWithUser, LikeWithExpand } from "./+page";

  type NotificationItem =
    | {
        kind: "follow_request";
        id: string;
        created: string;
        request: FollowWithUser;
      }
    | {
        kind: "follow";
        id: string;
        created: string;
        follow: FollowWithUser;
      }
    | {
        kind: "like";
        id: string;
        created: string;
        like: LikeWithExpand;
      };

  let { data } = $props();
  const pendingRequests = $derived(data.pendingRequests as FollowWithUser[]);
  const recentFollows = $derived(data.recentFollows as FollowWithUser[]);
  const recentLikes = $derived(data.recentLikes as LikeWithExpand[]);
  const initialFollowingIds = $derived(data.followingIds as string[]);
  const unreadLikeIds = $derived(data.unreadLikeIds as string[]);
  const unreadFollowIds = $derived(data.unreadFollowIds as string[]);

  // Mark unread items as read when the page mounts, then refresh the layout badge
  $effect(() => {
    const likeIds = unreadLikeIds;
    const followIds = unreadFollowIds;
    if (likeIds.length === 0 && followIds.length === 0) return;

    const markAsRead = async () => {
      await Promise.all([
        ...likeIds.map((id) =>
          pb
            .collection("likes")
            .update(id, { read: true })
            .catch(() => {}),
        ),
        ...followIds.map((id) =>
          pb
            .collection("follows")
            .update(id, { read: true })
            .catch(() => {}),
        ),
      ]);
      await invalidateAll();
    };

    markAsRead();
  });

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

  function getPostThumbnailUrl(post: PostsResponse) {
    if (!post.images || post.images.length === 0) return null;
    return pb.files.getURL(post, post.images[0], { thumb: "100x100" });
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

  // Build a unified, sorted list of items
  const allItems = $derived.by(() => {
    const items: NotificationItem[] = [];

    // Add pending follow requests (not declined, not already accepted locally)
    const acceptedIds = new Set(acceptedRequests.map((r) => r.id));
    for (const request of pendingRequests) {
      if (declinedIds.has(request.id) || acceptedIds.has(request.id)) continue;
      items.push({
        kind: "follow_request",
        id: `request-${request.id}`,
        created: request.created,
        request,
      });
    }

    // Add locally-accepted requests as "started following you"
    for (const request of acceptedRequests) {
      items.push({
        kind: "follow_request",
        id: `accepted-${request.id}`,
        created: request.created,
        request,
      });
    }

    // Add accepted follows from server data (but skip any that are already
    // shown as pending/accepted requests to avoid duplicates)
    const requestIds = new Set([
      ...pendingRequests.map((r) => r.id),
      ...acceptedRequests.map((r) => r.id),
    ]);
    for (const follow of recentFollows) {
      if (requestIds.has(follow.id)) continue;
      items.push({
        kind: "follow",
        id: `follow-${follow.id}`,
        created: follow.created,
        follow,
      });
    }

    // Add likes on user's posts
    for (const like of recentLikes) {
      items.push({
        kind: "like",
        id: `like-${like.id}`,
        created: like.created,
        like,
      });
    }

    // Sort by created date, newest first
    items.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
    );

    return items;
  });
</script>

<div class="pt-6">
  <h1 class="mb-6 text-xl font-semibold">Notifications</h1>

  {#if allItems.length === 0}
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
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      </div>
      <h2 class="font-medium">No notifications</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        When people interact with your account, you'll see it here
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each allItems as item (item.id)}
        {#if item.kind === "follow_request"}
          {@const request = item.request}
          {@const follower = request.expand?.follower}
          {@const isAccepted = acceptedRequests.some(
            (r) => r.id === request.id,
          )}
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
                {#if isAccepted}
                  <p class="text-sm">
                    <a
                      href={resolve(`/user/${follower.username}`)}
                      class="font-medium hover:underline"
                    >
                      {follower.name || "@" + follower.username}
                    </a>
                    started following you
                  </p>
                {:else}
                  <a
                    href={resolve(`/user/${follower.username}`)}
                    class="block truncate font-medium hover:underline"
                  >
                    {follower.name || "@" + follower.username}
                  </a>
                {/if}
                <p class="text-muted-foreground truncate text-xs">
                  {#if !isAccepted && follower.name}
                    @{follower.username} &middot;
                  {/if}
                  {formatDate(request.created)}
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
        {:else if item.kind === "follow"}
          {@const follow = item.follow}
          {@const follower = follow.expand?.follower}
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
                <p class="text-sm">
                  <a
                    href={resolve(`/user/${follower.username}`)}
                    class="font-medium hover:underline"
                  >
                    {follower.name || "@" + follower.username}
                  </a>
                  started following you
                </p>
                <p class="text-muted-foreground text-xs">
                  {formatDate(follow.created)}
                </p>
              </div>

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
            </div>
          {/if}
        {:else if item.kind === "like"}
          {@const like = item.like}
          {@const likeUser = like.expand?.user}
          {@const likePost = like.expand?.post}
          {#if likeUser}
            <div class="bg-card flex items-center gap-3 rounded-xl border p-4">
              <a
                href={resolve(`/user/${likeUser.username}`)}
                class="bg-muted flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
              >
                {#if getAvatarUrl(likeUser)}
                  <img
                    src={getAvatarUrl(likeUser)}
                    alt={likeUser.username}
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
                <p class="text-sm">
                  <a
                    href={resolve(`/user/${likeUser.username}`)}
                    class="font-medium hover:underline"
                  >
                    {likeUser.name || "@" + likeUser.username}
                  </a>
                  liked your post
                </p>
                <p class="text-muted-foreground text-xs">
                  {formatDate(like.created)}
                </p>
              </div>

              {#if likePost}
                <a
                  href={resolve(`/post/${likePost.id}`)}
                  class="bg-muted flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded"
                >
                  {#if getPostThumbnailUrl(likePost)}
                    <img
                      src={getPostThumbnailUrl(likePost)}
                      alt="Post"
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
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  {/if}
                </a>
              {/if}
            </div>
          {/if}
        {/if}
      {/each}
    </div>
  {/if}
</div>
