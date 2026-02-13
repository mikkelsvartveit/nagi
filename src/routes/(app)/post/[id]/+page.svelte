<script lang="ts">
  import Post from "$lib/components/Post.svelte";

  let { data } = $props();
  const post = $derived(data.post);
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));
</script>

<Post {post} {likedPostIds} />
