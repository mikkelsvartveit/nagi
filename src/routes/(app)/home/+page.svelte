<script lang="ts">
  import EmptyStateCard from "$lib/components/EmptyStateCard.svelte";
  import Post from "$lib/components/Post.svelte";
  import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  let { data } = $props();
  const posts = $derived(
    data.posts as PostsResponse<{ user: UsersResponse }>[],
  );
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));
</script>

<svelte:head>
  <title>Nagi</title>
</svelte:head>

<!-- Feed -->
{#if posts.length === 0}
  <EmptyStateCard
    title="Your feed is empty"
    description="Start following people to see their posts here"
  />
{:else}
  <div class="space-y-8">
    {#each posts as post (post.id)}
      <Post {post} {likedPostIds} />
    {/each}
  </div>
{/if}
