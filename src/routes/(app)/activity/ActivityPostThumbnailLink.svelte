<script lang="ts">
  import { resolve } from "$app/paths";
  import { getPostThumbnailUrl } from "$lib/pocketbase-media";
  import type { PostsResponse } from "$lib/pocketbase-typegen";

  let { post } = $props<{ post: PostsResponse }>();

  const thumbnailUrl = $derived.by(() => {
    return getPostThumbnailUrl(post);
  });
</script>

<a
  href={resolve(`/post/${post.id}`)}
  class="bg-muted flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded"
>
  {#if thumbnailUrl}
    <img src={thumbnailUrl} alt="Post" class="h-full w-full object-cover" />
  {:else}
    <span class="icon-[lucide--image] text-muted-foreground h-5 w-5"></span>
  {/if}
</a>
