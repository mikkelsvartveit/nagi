<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button } from "$lib/components/ui/button";
  import ActivityPostThumbnailLink from "./ActivityPostThumbnailLink.svelte";
  import ActivityUserAvatarLink from "./ActivityUserAvatarLink.svelte";
  import type { FollowWithUser, NotificationItem } from "./activity-types";

  let {
    item,
    acceptedRequestIds,
    isFollowing,
    isPendingRequest,
    isProcessing,
    loadingFollowBack,
    onAccept,
    onDecline,
    onFollowBack,
    formatDate,
  } = $props<{
    item: NotificationItem;
    acceptedRequestIds: Set<string>;
    isFollowing: (userId: string) => boolean;
    isPendingRequest: (userId: string) => boolean;
    isProcessing: (requestId: string) => boolean;
    loadingFollowBack: string | null;
    onAccept: (request: FollowWithUser) => Promise<void>;
    onDecline: (request: FollowWithUser) => Promise<void>;
    onFollowBack: (userId: string) => Promise<void>;
    formatDate: (dateStr: string) => string;
  }>();
</script>

{#if item.kind === "follow_request"}
  {@const request = item.request}
  {@const follower = request.expand?.follower}
  {@const isAccepted = acceptedRequestIds.has(request.id)}
  {#if follower}
    <div class="bg-card flex items-center gap-3 rounded-xl border p-4">
      <ActivityUserAvatarLink user={follower} />

      <div class="min-w-0 flex-1">
        {#if isAccepted}
          <p class="text-sm">
            <a
              href={resolve(`/u/${follower.username}`)}
              class="font-medium hover:underline"
            >
              {follower.name || "@" + follower.username}
            </a>
            started following you
          </p>
        {:else}
          <a
            href={resolve(`/u/${follower.username}`)}
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
            {#if isPendingRequest(follower.id)}
              <span class="text-muted-foreground text-sm">Requested</span>
            {:else}
              <Button
                size="sm"
                onclick={() => onFollowBack(follower.id)}
                disabled={loadingFollowBack === follower.id}
              >
                {#if loadingFollowBack === follower.id}
                  Following...
                {:else}
                  Follow back
                {/if}
              </Button>
            {/if}
          {:else}
            <span class="text-muted-foreground text-sm">Following</span>
          {/if}
        {:else}
          <Button
            size="sm"
            onclick={() => onAccept(request)}
            disabled={isProcessing(request.id)}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onclick={() => onDecline(request)}
            disabled={isProcessing(request.id)}
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
      <ActivityUserAvatarLink user={follower} />

      <div class="min-w-0 flex-1">
        <p class="text-sm">
          <a
            href={resolve(`/u/${follower.username}`)}
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
        {#if isPendingRequest(follower.id)}
          <span class="text-muted-foreground text-sm">Requested</span>
        {:else}
          <Button
            size="sm"
            onclick={() => onFollowBack(follower.id)}
            disabled={loadingFollowBack === follower.id}
          >
            {#if loadingFollowBack === follower.id}
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
{:else if item.kind === "like"}
  {@const like = item.like}
  {@const likeUser = like.expand?.user}
  {@const likePost = like.expand?.post}
  {#if likeUser}
    <div class="bg-card flex items-center gap-3 rounded-xl border p-4">
      <ActivityUserAvatarLink user={likeUser} />

      <div class="min-w-0 flex-1">
        <p class="text-sm">
          <a
            href={resolve(`/u/${likeUser.username}`)}
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
        <ActivityPostThumbnailLink post={likePost} />
      {/if}
    </div>
  {/if}
{/if}
