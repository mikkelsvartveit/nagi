<script lang="ts">
  import { pb } from "$lib/pocketbase";
  import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  type PostWithUser = PostsResponse<{ user: UsersResponse }>;

  let { post }: { post: PostWithUser } = $props();
  const postUser = $derived(post.expand?.user as UsersResponse | undefined);

  let currentImageIndex = $state(0);
  let isHovering = $state(false);
  let carouselEl: HTMLDivElement | undefined = $state();

  // Track container height based on tallest image
  let containerHeight = $state(0);

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

  function getAvatarUrl() {
    if (!postUser?.avatar) return null;
    return pb.files.getURL(postUser, postUser.avatar, { thumb: "100x100" });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<article class="space-y-3">
  <!-- Header: User info -->
  <div class="flex items-center gap-3">
    <div
      class="bg-muted flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
    >
      {#if getAvatarUrl()}
        <img
          src={getAvatarUrl()}
          alt={postUser?.username || "User"}
          class="h-full w-full object-cover"
        />
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-muted-foreground h-4 w-4"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      {/if}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold">
        {postUser?.username || "Unknown"}
      </p>
      {#if post.location}
        <p class="text-muted-foreground truncate text-xs">
          {post.location}
        </p>
      {/if}
    </div>
  </div>

  <!-- Image carousel -->
  <div
    class="relative -mx-4 overflow-hidden"
    role="region"
    aria-label="Image carousel"
    onmouseenter={() => (isHovering = true)}
    onmouseleave={() => (isHovering = false)}
  >
    <div
      bind:this={carouselEl}
      onscroll={handleScroll}
      class="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
      style="height: {containerHeight > 0 ? `${containerHeight}px` : 'auto'}"
    >
      {#each post.images as image, index (image)}
        <div
          class="bg-muted flex w-full flex-shrink-0 snap-center items-center justify-center"
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
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

  <!-- Post info -->
  <div class="space-y-1">
    <!-- Caption -->
    {#if post.caption}
      <p>{post.caption}</p>
    {/if}

    <!-- Date -->
    <p class="text-muted-foreground text-xs">{formatDate(post.created)}</p>
  </div>
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
</style>
