<script lang="ts">
  import PostCard from "$lib/components/PostCard.svelte";

  let { data } = $props();
  const post = $derived(data.post);
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));
</script>

<PostCard {post} {likedPostIds} />
