<script lang="ts">
  import { resolve } from "$app/paths";
  import { getUserAvatarUrl } from "$lib/pocketbase-media";
  import { cn } from "$lib/utils";
  import type { UsersResponse } from "$lib/pocketbase-typegen";
  import type { Snippet } from "svelte";

  let {
    user,
    path,
    className,
    avatarClass = "h-10 w-10",
    imageThumb = "100x100",
    trailing,
    onclick,
  } = $props<{
    user: UsersResponse;
    path?: string;
    className?: string;
    avatarClass?: string;
    imageThumb?: "100x100" | "320x320";
    trailing?: Snippet;
    onclick?: (event: MouseEvent) => void;
  }>();

  const avatarUrl = $derived(getUserAvatarUrl(user, imageThumb));
</script>

<a
  href={resolve(path ?? `/u/${user.username}`)}
  class={cn("flex min-w-0 items-center gap-3", className)}
  {onclick}
>
  <div
    class={cn(
      "bg-muted flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full",
      avatarClass,
    )}
  >
    {#if avatarUrl}
      <img
        src={avatarUrl}
        alt={user.username}
        class="h-full w-full object-cover"
      />
    {:else}
      <span class="icon-[lucide--user] text-muted-foreground h-5 w-5"></span>
    {/if}
  </div>

  <div class="min-w-0 flex-1">
    <p class="truncate font-medium">{user.name || "@" + user.username}</p>
    {#if user.name}
      <p class="text-muted-foreground truncate text-sm">@{user.username}</p>
    {/if}
  </div>

  {#if trailing}
    {@render trailing()}
  {/if}
</a>
