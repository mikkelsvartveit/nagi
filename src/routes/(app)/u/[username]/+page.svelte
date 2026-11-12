<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import EmptyStateCard from "$lib/components/EmptyStateCard.svelte";
  import { getUserAvatarUrl } from "$lib/pocketbase-media";
  import { pb } from "$lib/pocketbase";
  import { followUser } from "$lib/useFollowActions";
  import { Button } from "$lib/components/ui/button";
  import Post from "$lib/components/Post.svelte";
  import type {
    FollowsResponse,
    PostsResponse,
    UsersResponse,
  } from "$lib/pocketbase-typegen";

  let { data } = $props();
  const profileUser = $derived(data.profileUser as UsersResponse | null);
  const posts = $derived(
    data.posts as PostsResponse<{ user: UsersResponse }>[],
  );
  const postsCount = $derived(data.postsCount);
  const isOwnProfile = $derived(data.isOwnProfile);
  // Follow/unfollow both reload page data, so the server value is the source of truth
  const followStatus = $derived(data.followStatus as FollowsResponse | null);
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));

  let loading = $state(false);

  async function handleFollow() {
    if (!profileUser) return;
    loading = true;

    try {
      await followUser(profileUser);
    } catch (error) {
      console.error("Failed to follow:", error);
    } finally {
      loading = false;
    }
  }

  async function handleUnfollow() {
    if (!followStatus) return;
    loading = true;

    try {
      await pb.collection("follows").delete(followStatus.id);
      await invalidateAll();
    } catch (error) {
      console.error("Failed to unfollow:", error);
    } finally {
      loading = false;
    }
  }

  const avatarUrl = $derived(getUserAvatarUrl(profileUser, "320x320"));

  const canViewPosts = $derived(
    isOwnProfile || profileUser?.isPublic || followStatus?.accepted,
  );
</script>

{#if !profileUser}
  <div class="py-20 text-center">
    <h1 class="text-xl font-semibold">User not found</h1>
    <p class="text-muted-foreground mt-2">
      The user you're looking for doesn't exist.
    </p>
  </div>
{:else}
  <div class="pt-10 text-center">
    <div
      class="bg-muted mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
    >
      {#if avatarUrl}
        <img src={avatarUrl} alt="Profile" class="h-full w-full object-cover" />
      {:else}
        <span class="icon-[lucide--user] text-muted-foreground h-10 w-10"
        ></span>
      {/if}
    </div>
    <h1 class="text-xl font-semibold">
      {profileUser.name || "@" + profileUser.username}
    </h1>
    <p class="text-muted-foreground mt-1 text-sm">
      {profileUser.name ? "@" + profileUser.username : ""}
    </p>

    {#if profileUser.bio}
      <p class="text-muted-foreground mx-auto mt-3 max-w-xs text-sm">
        {profileUser.bio}
      </p>
    {/if}

    {#if canViewPosts}
      <div class="mt-4">
        <p class="text-lg font-semibold">{postsCount}</p>
        <p class="text-muted-foreground text-sm">Posts</p>
      </div>
    {/if}

    {#if !isOwnProfile}
      <div class="mt-4">
        {#if followStatus}
          <Button
            variant="secondary"
            size="sm"
            onclick={handleUnfollow}
            disabled={loading}
          >
            {followStatus.accepted ? "Following" : "Requested"}
          </Button>
        {:else}
          <Button size="sm" onclick={handleFollow} disabled={loading}>
            Follow
          </Button>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Posts -->
  {#if !canViewPosts}
    <EmptyStateCard
      className="mt-8"
      title="This account is private"
      description="Follow this account to see their posts"
    >
      {#snippet icon()}
        <span class="icon-[lucide--lock] text-muted-foreground h-6 w-6"></span>
      {/snippet}
    </EmptyStateCard>
  {:else if posts.length === 0}
    <EmptyStateCard
      className="mt-8"
      title="No posts yet"
      description="This user hasn't posted anything yet"
    />
  {:else}
    <div class="mt-10 space-y-10">
      {#each posts as post (post.id)}
        <Post {post} {likedPostIds} />
      {/each}
    </div>
  {/if}
{/if}
