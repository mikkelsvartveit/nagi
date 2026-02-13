<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import PostCard from "$lib/components/PostCard.svelte";
  import type {
    FollowsResponse,
    PostsResponse,
    UsersResponse,
  } from "$lib/pocketbase-typegen";

  type PostWithUser = PostsResponse<{ user: UsersResponse }>;

  let { data } = $props();
  const profileUser = $derived(data.profileUser as UsersResponse | null);
  const posts = $derived(data.posts as PostWithUser[]);
  const isOwnProfile = $derived(data.isOwnProfile);
  const serverFollowStatus = $derived(
    data.followStatus as FollowsResponse | null,
  );
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));

  // Local state for optimistic updates: undefined = use server, null = explicitly unfollowed
  let localFollowStatus = $state<FollowsResponse | null | undefined>(undefined);

  let loading = $state(false);

  // Reset local state when server data changes
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    serverFollowStatus; // Track dependency
    localFollowStatus = undefined;
  });

  // Use local state for optimistic updates, fallback to server data
  const effectiveFollowStatus = $derived(
    localFollowStatus === undefined ? serverFollowStatus : localFollowStatus,
  );

  function getAvatarUrl() {
    if (!profileUser?.avatar) return null;
    return pb.files.getURL(profileUser, profileUser.avatar, {
      thumb: "320x320",
    });
  }

  async function handleFollow() {
    if (!profileUser) return;
    loading = true;

    try {
      // Create a follow request
      const newFollow = await pb.collection("follows").create<FollowsResponse>({
        follower: pb.authStore.model?.id,
        following: profileUser.id,
        accepted: profileUser.isPublic ? true : false, // Auto-accept if profile is public
      });
      localFollowStatus = newFollow;
      await invalidateAll();
    } catch (error) {
      console.error("Failed to follow:", error);
    } finally {
      loading = false;
    }
  }

  async function handleUnfollow() {
    if (!effectiveFollowStatus) return;
    loading = true;

    try {
      await pb.collection("follows").delete(effectiveFollowStatus.id);
      localFollowStatus = null;
      await invalidateAll();
    } catch (error) {
      console.error("Failed to unfollow:", error);
    } finally {
      loading = false;
    }
  }

  function getFollowButtonText() {
    if (!effectiveFollowStatus) return "Follow";
    if (effectiveFollowStatus.accepted) return "Following";
    return "Requested";
  }

  function getFollowButtonVariant(): "default" | "outline" | "secondary" {
    if (!effectiveFollowStatus) return "default";
    return "secondary";
  }

  const canViewPosts = $derived(
    isOwnProfile ||
      profileUser?.isPublic ||
      (effectiveFollowStatus && effectiveFollowStatus.accepted),
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
      {#if getAvatarUrl()}
        <img
          src={getAvatarUrl()}
          alt="Profile"
          class="h-full w-full object-cover"
        />
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

    {#if !isOwnProfile}
      <div class="mt-4">
        {#if effectiveFollowStatus}
          <Button
            variant={getFollowButtonVariant()}
            size="sm"
            onclick={handleUnfollow}
            disabled={loading}
          >
            {getFollowButtonText()}
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
    <div class="bg-card mt-8 rounded-xl border p-8 text-center">
      <div
        class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
      >
        <span class="icon-[lucide--lock] text-muted-foreground h-6 w-6"></span>
      </div>
      <h2 class="font-medium">This account is private</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        Follow this account to see their posts
      </p>
    </div>
  {:else if posts.length === 0}
    <div class="bg-card mt-8 rounded-xl border p-8 text-center">
      <div
        class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
      >
        <span class="icon-[lucide--image] text-muted-foreground h-6 w-6"></span>
      </div>
      <h2 class="font-medium">No posts yet</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        This user hasn't posted anything yet
      </p>
    </div>
  {:else}
    <div class="mt-10 space-y-10">
      {#each posts as post (post.id)}
        <PostCard {post} {likedPostIds} />
      {/each}
    </div>
  {/if}
{/if}
