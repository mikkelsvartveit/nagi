<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import type {
    LikesResponse,
    PostsResponse,
    UsersResponse,
  } from "$lib/pocketbase-typegen";

  type PostWithUser = PostsResponse<{ user: UsersResponse }>;

  let {
    post,
    likedPostIds = new Set<string>(),
  }: { post: PostWithUser; likedPostIds?: Set<string> } = $props();
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

  // Likes dialog (for post owner)
  let likesDialogOpen = $state(false);
  let likesUsers = $state<UsersResponse[]>([]);
  let likesLoading = $state(false);

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

  function getAvatarUrl() {
    if (!postUser?.avatar) return null;
    return pb.files.getURL(postUser, postUser.avatar, { thumb: "100x100" });
  }

  function getLikeUserAvatarUrl(user: UsersResponse) {
    if (!user.avatar) return null;
    return pb.files.getURL(user, user.avatar, { thumb: "100x100" });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item
            class="text-destructive! hover:text-destructive! focus:text-destructive!"
            onclick={() => (deleteDialogOpen = true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-destructive! mr-2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          stroke="none"
          class="h-24 w-24 drop-shadow-lg"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
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

  <!-- Like button -->
  <div class="mb-2 flex items-center">
    <button
      onclick={toggleLike}
      class="group -ml-1 flex items-center px-1 transition-transform active:scale-90"
      aria-label={isLiked ? "Unlike" : "Like"}
      disabled={likeLoading}
    >
      {#if isLiked}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          class="h-6 w-6 text-red-500"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-muted-foreground group-hover:text-foreground h-6 w-6 transition-colors"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
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
    <p class="text-muted-foreground text-xs">{formatDate(post.created)}</p>
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

  <!-- Likes dialog (post owner only) -->
  <Dialog.Root bind:open={likesDialogOpen}>
    <Dialog.Content class="max-h-[80vh] sm:max-w-md">
      <Dialog.Header>
        <Dialog.Title>Likes</Dialog.Title>
      </Dialog.Header>
      <div class="max-h-[60vh] overflow-y-auto">
        {#if likesLoading}
          <div class="flex justify-center py-8">
            <svg
              class="text-muted-foreground h-6 w-6 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        {:else if likesUsers.length === 0}
          <p class="text-muted-foreground py-8 text-center text-sm">
            No likes yet
          </p>
        {:else}
          <div class="space-y-3">
            {#each likesUsers as likeUser (likeUser.id)}
              <a
                href={resolve(`/u/${likeUser.username}`)}
                class="hover:bg-accent flex items-center gap-3 rounded-lg p-2 transition-colors"
                onclick={() => (likesDialogOpen = false)}
              >
                <div
                  class="bg-muted flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
                >
                  {#if getLikeUserAvatarUrl(likeUser)}
                    <img
                      src={getLikeUserAvatarUrl(likeUser)}
                      alt={likeUser.username}
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
                      class="text-muted-foreground h-5 w-5"
                    >
                      <circle cx="12" cy="8" r="5" />
                      <path d="M20 21a8 8 0 0 0-16 0" />
                    </svg>
                  {/if}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">
                    {likeUser.name || "@" + likeUser.username}
                  </p>
                  {#if likeUser.name}
                    <p class="text-muted-foreground truncate text-xs">
                      @{likeUser.username}
                    </p>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>
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
