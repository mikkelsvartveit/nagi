<script lang="ts">
  import PostCard from "$lib/components/PostCard.svelte";

  let { data } = $props();
  const post = $derived(data.post);
</script>

<PostCard {post} />
