<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import EmptyStateCard from "$lib/components/EmptyStateCard.svelte";
  import ActivityListItem from "./ActivityListItem.svelte";
  import type {
    FollowWithUser,
    LikeWithExpand,
    NotificationItem,
  } from "./activity-types";
  import { pb } from "$lib/pocketbase";
  import type { UsersResponse } from "$lib/pocketbase-typegen";
  import { formatDate } from "$lib/utils";
  import { SvelteSet } from "svelte/reactivity";

  let { data } = $props();
  const pendingRequests = $derived(data.pendingRequests as FollowWithUser[]);
  const recentFollows = $derived(data.recentFollows as FollowWithUser[]);
  const recentLikes = $derived(data.recentLikes as LikeWithExpand[]);
  const initialFollowingIds = $derived(data.followingIds as string[]);
  const pendingFollowingIds = $derived(data.pendingFollowingIds as string[]);
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

  function isFollowing(userId: string) {
    return (
      initialFollowingIds.includes(userId) || followedBackIds.includes(userId)
    );
  }

  function isPendingRequest(userId: string) {
    return pendingFollowingIds.includes(userId);
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

  const acceptedRequestIds = $derived(
    new Set(acceptedRequests.map((r) => r.id)),
  );

  function formatActivityDate(dateStr: string) {
    return formatDate(dateStr, {
      month: "short",
      day: "numeric",
    });
  }

  function isProcessing(requestId: string) {
    return processingIds.has(requestId);
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
  <h1 class="mb-6 text-xl font-semibold">Activity</h1>

  {#if allItems.length === 0}
    <EmptyStateCard
      title="No activity"
      description="When people interact with your account, you'll see it here"
    >
      {#snippet icon()}
        <span class="icon-[lucide--bell] text-muted-foreground h-6 w-6"></span>
      {/snippet}
    </EmptyStateCard>
  {:else}
    <div class="space-y-3">
      {#each allItems as item (item.id)}
        <ActivityListItem
          {item}
          {acceptedRequestIds}
          {isFollowing}
          {isPendingRequest}
          {isProcessing}
          {loadingFollowBack}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onFollowBack={handleFollowBack}
          formatDate={formatActivityDate}
        />
      {/each}
    </div>
  {/if}
</div>
