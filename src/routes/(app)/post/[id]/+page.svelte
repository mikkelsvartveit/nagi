<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import Post from "$lib/components/Post.svelte";

  let { data } = $props();
  const post = $derived(data.post);
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));

  // Reloading this route after a delete would 404, so leave it instead
  const handleDeleted = () => goto(resolve("/profile"));
</script>

<Post {post} {likedPostIds} onDeleted={handleDeleted} />
