<script lang="ts">
  import { getUserAvatarUrl } from "$lib/pocketbase-media";
  import type { UsersResponse } from "$lib/pocketbase-typegen";

  let { user, uploading, onAvatarChange } = $props<{
    user: UsersResponse;
    uploading: boolean;
    onAvatarChange: (e: Event) => Promise<void>;
  }>();

  let fileInput: HTMLInputElement | undefined = $state();

  const avatarUrl = $derived.by(() => {
    return getUserAvatarUrl(user, "320x320");
  });
</script>

<div class="text-center">
  <button
    onclick={() => fileInput?.click()}
    class="group relative mx-auto mb-4 block"
    disabled={uploading}
  >
    <div
      class="bg-muted flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
    >
      {#if avatarUrl}
        <img src={avatarUrl} alt="Profile" class="h-full w-full object-cover" />
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
    onchange={onAvatarChange}
  />
  <h1 class="text-xl font-semibold">{user?.name || "@" + user?.username}</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    {user?.name ? "@" + user.username : ""}
  </p>
</div>
