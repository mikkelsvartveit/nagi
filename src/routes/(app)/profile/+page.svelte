<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import EmptyStateCard from "$lib/components/EmptyStateCard.svelte";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import Post from "$lib/components/Post.svelte";
  import ProfileAvatarEditor from "./ProfileAvatarEditor.svelte";
  import ProfileTopBar from "./ProfileTopBar.svelte";
  import { Switch } from "$lib/components/ui/switch";
  import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";

  let { data } = $props();
  const user = $derived(data.user as UsersResponse | null);
  const posts = $derived(
    data.posts as PostsResponse<{ user: UsersResponse }>[],
  );
  const followersCount = $derived(data.followersCount);
  const followingCount = $derived(data.followingCount);
  const likedPostIds = $derived(new Set(data.likedPostIds as string[]));

  let uploading = $state(false);
  let updatingPrivacy = $state(false);

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
</script>

<ProfileTopBar onLogout={handleLogout} />

{#if user}
  <ProfileAvatarEditor {user} {uploading} onAvatarChange={handleAvatarChange} />
{/if}

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
  <EmptyStateCard
    className="mt-8"
    title="No posts yet"
    description="Your posts will appear here"
  />
{:else}
  <div class="mt-10 space-y-10">
    {#each posts as post (post.id)}
      <Post {post} {likedPostIds} />
    {/each}
  </div>
{/if}
