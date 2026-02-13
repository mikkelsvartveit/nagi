<script lang="ts">
  import PostCard from "$lib/components/PostCard.svelte";
  import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  type PostWithUser = PostsResponse<{ user: UsersResponse }>;

  let { data } = $props();
  const posts = $derived(data.posts as PostWithUser[]);
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));
</script>

<svelte:head>
  <title>Nagi</title>
</svelte:head>

<!-- Feed -->
{#if posts.length === 0}
  <div class="space-y-4">
    <div class="bg-card rounded-xl border p-8 text-center">
      <div
        class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
      >
        <span class="icon-[lucide--image] text-muted-foreground h-6 w-6"></span>
      </div>
      <h2 class="font-medium">Your feed is empty</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        Start following people to see their posts here
      </p>
    </div>
  </div>
{:else}
  <div class="space-y-8">
    {#each posts as post (post.id)}
      <PostCard {post} {likedPostIds} />
    {/each}
  </div>
{/if}
