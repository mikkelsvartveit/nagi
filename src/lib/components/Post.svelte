<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { getUserAvatarUrl } from "$lib/pocketbase-media";
  import { pb } from "$lib/pocketbase";
  import { formatDate } from "$lib/utils";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import type {
    LikesResponse,
    PostsResponse,
    UsersResponse,
  } from "$lib/pocketbase-typegen";

  let {
    post,
    likedPostIds = new Set<string>(),
  }: {
    post: PostsResponse<{ user: UsersResponse }>;
    likedPostIds?: Set<string>;
  } = $props();
  const postUser = $derived(post.expand?.user as UsersResponse | undefined);
  const currentUser = $derived(pb.authStore.model);
  const isOwner = $derived(currentUser?.id === post.user);

  let currentImageIndex = $state(0);
  let isHovering = $state(false);
  let carouselEl: HTMLDivElement | undefined = $state();
  let deleteDialogOpen = $state(false);
  let deleting = $state(false);

  // Like state
  let liked = $derived(likedPostIds.has(post.id));
  let localLikeOverride = $state<boolean | null>(null);
  let likeRecordId = $state<string | null>(null);
  let likeLoading = $state(false);

  const isLiked = $derived(
    localLikeOverride !== null ? localLikeOverride : liked,
  );

  // Double-tap state
  let lastTapTime = $state(0);
  let showHeartAnimation = $state(false);

  // Track container height based on tallest image
  let containerHeight = $state(0);

  async function handleDelete() {
    deleting = true;
    try {
      await pb.collection("posts").delete(post.id);
      deleteDialogOpen = false;
      await invalidateAll();
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      deleting = false;
    }
  }

  async function toggleLike() {
    if (likeLoading) return;
    const currentUserId = currentUser?.id;
    if (!currentUserId) return;

    likeLoading = true;
    const wasLiked = isLiked;

    // Optimistic update
    localLikeOverride = !wasLiked;

    try {
      if (wasLiked) {
        // Unlike: find and delete the like record
        if (!likeRecordId) {
          // Need to find the record first
          const existing = await pb
            .collection("likes")
            .getFirstListItem<LikesResponse>(
              `user = "${currentUserId}" && post = "${post.id}"`,
            );
          likeRecordId = existing.id;
        }
        await pb.collection("likes").delete(likeRecordId!);
        likeRecordId = null;
      } else {
        // Like: create the like record
        const newLike = await pb
          .collection("likes")
          .create<LikesResponse>({ user: currentUserId, post: post.id });
        likeRecordId = newLike.id;
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert optimistic update
      localLikeOverride = wasLiked;
    } finally {
      likeLoading = false;
    }
  }

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      // Double-tap detected
      if (!isLiked) {
        toggleLike();
      }
      // Show heart animation
      showHeartAnimation = true;
      setTimeout(() => {
        showHeartAnimation = false;
      }, 800);
      lastTapTime = 0;
    } else {
      lastTapTime = now;
    }
  }

  function handleImageLoad(e: Event) {
    const img = e.target as HTMLImageElement;
    const containerWidth = img.parentElement?.clientWidth || 0;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const imageHeight = containerWidth / aspectRatio;

    if (imageHeight > containerHeight) {
      containerHeight = imageHeight;
    }
  }

  function handleScroll() {
    if (!carouselEl) return;
    const scrollLeft = carouselEl.scrollLeft;
    const itemWidth = carouselEl.clientWidth;
    currentImageIndex = Math.round(scrollLeft / itemWidth);
  }

  function scrollToIndex(index: number) {
    if (!carouselEl) return;
    const itemWidth = carouselEl.clientWidth;
    carouselEl.scrollTo({ left: index * itemWidth, behavior: "smooth" });
  }

  function getImageUrl(index: number) {
    return pb.files.getURL(post, post.images[index]);
  }

  function nextImage() {
    if (currentImageIndex < post.images.length - 1) {
      scrollToIndex(currentImageIndex + 1);
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      scrollToIndex(currentImageIndex - 1);
    }
  }

  function formatPostDate(dateStr: string) {
    return formatDate(dateStr, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<article class="space-y-3 pt-4">
  <!-- Header: User info -->
  <div class="flex items-center gap-3">
    <div
      class="bg-muted flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
    >
      {#if getUserAvatarUrl(postUser)}
        <img
          src={getUserAvatarUrl(postUser)}
          alt={postUser?.username || "User"}
          class="h-full w-full object-cover"
        />
      {:else}
        <span class="icon-[lucide--user] text-muted-foreground h-4 w-4"></span>
      {/if}
    </div>

    <div class="min-w-0 flex-1">
      <a
        href={resolve(`/u/${postUser?.username}`)}
        class="block truncate text-sm font-semibold hover:underline"
      >
        {postUser?.username || "Unknown"}
      </a>
      {#if post.location}
        <p class="text-muted-foreground truncate text-xs">
          {post.location}
        </p>
      {/if}
    </div>

    {#if isOwner}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          aria-label="Post options"
        >
          <span class="icon-[lucide--ellipsis-vertical] h-5 w-5"></span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item
            class="text-destructive! hover:text-destructive! focus:text-destructive!"
            onclick={() => (deleteDialogOpen = true)}
          >
            <span class="icon-[lucide--trash-2] text-destructive! mr-2 h-4 w-4"
            ></span>
            Delete post
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}
  </div>

  <!-- Image carousel -->
  <div
    class="relative -mx-4 overflow-hidden"
    role="region"
    aria-label="Image carousel"
    onmouseenter={() => (isHovering = true)}
    onmouseleave={() => (isHovering = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      bind:this={carouselEl}
      onscroll={handleScroll}
      onclick={handleDoubleTap}
      class="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
      style="height: {containerHeight > 0 ? `${containerHeight}px` : 'auto'}"
    >
      {#each post.images as image, index (image)}
        <div
          class="bg-muted flex w-full shrink-0 snap-center items-center justify-center"
        >
          <img
            src={getImageUrl(index)}
            alt={post.caption || `Post image ${index + 1}`}
            class="max-h-full max-w-full object-contain select-none"
            draggable="false"
            onload={handleImageLoad}
          />
        </div>
      {/each}
    </div>

    <!-- Double-tap heart animation -->
    {#if showHeartAnimation}
      <div
        class="heart-animation pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          class="icon-[lucide--heart] h-24 w-24 fill-current text-white drop-shadow-lg"
        ></span>
      </div>
    {/if}

    {#if post.images.length > 1}
      <!-- Navigation arrows (visible on hover only, hidden on touch devices) -->
      {#if currentImageIndex > 0}
        <button
          onclick={prevImage}
          aria-label="Previous image"
          class="nav-arrow absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70 {isHovering
            ? 'hovering'
            : ''}"
        >
          <span class="icon-[lucide--chevron-left] h-5 w-5"></span>
        </button>
      {/if}
      {#if currentImageIndex < post.images.length - 1}
        <button
          onclick={nextImage}
          aria-label="Next image"
          class="nav-arrow absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70 {isHovering
            ? 'hovering'
            : ''}"
        >
          <span class="icon-[lucide--chevron-right] h-5 w-5"></span>
        </button>
      {/if}

      <!-- Dots indicator -->
      <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {#each post.images as image, index (image)}
          <button
            onclick={() => scrollToIndex(index)}
            aria-label="Go to image {index + 1}"
            class="h-2 w-2 rounded-full transition-colors {index ===
            currentImageIndex
              ? 'bg-white'
              : 'bg-white/50 hover:bg-white/75'}"
          ></button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Like button -->
  <div class="mb-2 flex items-center">
    <button
      onclick={toggleLike}
      class="group -ml-1 flex items-center px-1 transition-transform active:scale-90"
      aria-label={isLiked ? "Unlike" : "Like"}
      disabled={likeLoading}
    >
      {#if isLiked}
        <span class="icon-[lucide--heart] h-6 w-6 fill-current text-red-500"
        ></span>
      {:else}
        <span
          class="icon-[lucide--heart] text-muted-foreground group-hover:text-foreground h-6 w-6 transition-colors"
        ></span>
      {/if}
    </button>
  </div>

  <!-- Post info -->
  <div class="space-y-1">
    <!-- Caption -->
    {#if post.caption}
      <p>{post.caption}</p>
    {/if}

    <!-- Date -->
    <p class="text-muted-foreground text-xs">{formatPostDate(post.created)}</p>
  </div>

  <!-- Delete confirmation dialog -->
  <AlertDialog.Root bind:open={deleteDialogOpen}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete post</AlertDialog.Title>
        <AlertDialog.Description>
          This will permanently delete this post and its images. This action
          cannot be undone.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel disabled={deleting}>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action
          onclick={handleDelete}
          disabled={deleting}
          class="bg-destructive hover:bg-destructive/90 text-white"
        >
          {#if deleting}
            Deleting...
          {:else}
            Delete
          {/if}
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</article>

<style>
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }

  /* Hide arrows by default on touch devices */
  .nav-arrow {
    display: none;
  }

  /* Only show arrows on devices that support hover (non-touch) */
  @media (hover: hover) {
    .nav-arrow {
      display: block;
      opacity: 0;
    }
    .nav-arrow.hovering {
      opacity: 1;
    }
  }

  /* Heart animation for double-tap */
  .heart-animation {
    animation: heart-pop 0.8s ease-out forwards;
  }

  @keyframes heart-pop {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    15% {
      opacity: 1;
      transform: scale(1.2);
    }
    30% {
      transform: scale(0.95);
    }
    45%,
    60% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1);
    }
  }
</style>
