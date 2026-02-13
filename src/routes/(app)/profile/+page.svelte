<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import PostCard from "$lib/components/PostCard.svelte";
  import { Switch } from "$lib/components/ui/switch";
  import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  type PostWithUser = PostsResponse<{ user: UsersResponse }>;

  let { data } = $props();
  const user = $derived(data.user);
  const posts = $derived(data.posts as PostWithUser[]);
  const followersCount = $derived(data.followersCount);
  const followingCount = $derived(data.followingCount);
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));

  let fileInput: HTMLInputElement | undefined = $state();
  let uploading = $state(false);
  let updatingPrivacy = $state(false);

  function getAvatarUrl() {
    if (!user?.avatar) return null;
    return pb.files.getURL(user, user.avatar, { thumb: "320x320" });
  }

  async function handleAvatarChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !user) return;

    uploading = true;
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await pb.collection("users").update(user.id, formData);
      await invalidateAll();
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      uploading = false;
    }
  }

  async function handlePrivacyToggle(checked: boolean) {
    if (!user) return;
    updatingPrivacy = true;

    try {
      await pb.collection("users").update(user.id, { isPublic: checked });
      await invalidateAll();
    } catch (error) {
      console.error("Failed to update privacy setting:", error);
    } finally {
      updatingPrivacy = false;
    }
  }

  const handleLogout = async () => {
    pb.authStore.clear();
    await invalidateAll();
    goto(resolve("/login"));
  };

  function handleHeaderClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    // Don't scroll if clicking on a button or link
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<header
  onclick={handleHeaderClick}
  role="presentation"
  class="top-0 z-30 -mx-4 mb-6 cursor-pointer border-b px-4"
>
  <div class="mx-auto flex h-14 max-w-lg items-center justify-between">
    <a href={resolve("/home")} class="flex items-center gap-2">
      <img src="/favicon.png" alt="Nagi logo" class="h-8 w-8" />
      <span class="font-semibold">Nagi</span>
    </a>
    <div class="flex items-center gap-2">
      <button
        onclick={() => window.location.reload()}
        class="text-muted-foreground hover:text-foreground flex items-center justify-center p-2"
        aria-label="Refresh"
      >
        <span class="icon-[lucide--refresh-cw] inline-block h-5 w-5 shrink-0"
        ></span>
      </button>

      <button
        onclick={handleLogout}
        class="text-muted-foreground hover:text-foreground flex items-center justify-center p-2"
        aria-label="Sign out"
      >
        <span class="icon-[lucide--log-out] inline-block h-5 w-5 shrink-0"
        ></span>
      </button>
    </div>
  </div>
</header>

<div class="text-center">
  <button
    onclick={() => fileInput?.click()}
    class="group relative mx-auto mb-4 block"
    disabled={uploading}
  >
    <div
      class="bg-muted flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
    >
      {#if getAvatarUrl()}
        <img
          src={getAvatarUrl()}
          alt="Profile"
          class="h-full w-full object-cover"
        />
      {:else}
        <span class="icon-[lucide--user] text-muted-foreground h-10 w-10"
        ></span>
      {/if}
    </div>
    <div
      class="bg-background absolute -top-0.5 -right-0.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border shadow"
    >
      <span class="icon-[lucide--pencil] text-muted-foreground h-3.5 w-3.5"
      ></span>
    </div>
    <div
      class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
    >
      {#if uploading}
        <span class="icon-[lucide--loader-2] h-6 w-6 animate-spin text-white"
        ></span>
      {:else}
        <span class="icon-[lucide--upload] h-6 w-6 text-white"></span>
      {/if}
    </div>
  </button>
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    class="hidden"
    onchange={handleAvatarChange}
  />
  <h1 class="text-xl font-semibold">{user?.name || "@" + user?.username}</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    {user?.name ? "@" + user.username : ""}
  </p>
</div>

<!-- Stats -->
<div class="mt-6 flex justify-center gap-2">
  <div class="w-20 text-center">
    <p class="text-lg font-semibold">{posts.length}</p>
    <p class="text-muted-foreground text-sm">Posts</p>
  </div>
  <a
    href={resolve("/profile/followers")}
    class="w-20 text-center hover:opacity-70"
  >
    <p class="text-lg font-semibold">{followersCount}</p>
    <p class="text-muted-foreground text-sm">Followers</p>
  </a>
  <a
    href={resolve("/profile/following")}
    class="w-20 text-center hover:opacity-70"
  >
    <p class="text-lg font-semibold">{followingCount}</p>
    <p class="text-muted-foreground text-sm">Following</p>
  </a>
</div>

<!-- Settings -->
<div class="bg-card mt-6 rounded-xl border p-4">
  <div class="flex items-center justify-between">
    <div>
      <p class="font-medium">Public profile</p>
      <p class="text-muted-foreground text-sm">
        Anyone can follow you without approval
      </p>
    </div>
    <Switch
      checked={user?.isPublic ?? false}
      onCheckedChange={handlePrivacyToggle}
      disabled={updatingPrivacy}
    />
  </div>
</div>

<!-- Posts -->
{#if posts.length === 0}
  <div class="bg-card mt-8 rounded-xl border p-8 text-center">
    <div
      class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
    >
      <span class="icon-[lucide--image] text-muted-foreground h-6 w-6"></span>
    </div>
    <h2 class="font-medium">No posts yet</h2>
    <p class="text-muted-foreground mt-1 text-sm">
      Your posts will appear here
    </p>
  </div>
{:else}
  <div class="mt-10 space-y-10">
    {#each posts as post (post.id)}
      <PostCard {post} {likedPostIds} />
    {/each}
  </div>
{/if}
