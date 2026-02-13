<script lang="ts">
  import { resolve } from "$app/paths";
  import { getUserAvatarUrl } from "$lib/pocketbase-media";
  import type { UsersResponse } from "$lib/pocketbase-typegen";

  let { user } = $props<{ user: UsersResponse }>();

  const avatarUrl = $derived.by(() => {
    return getUserAvatarUrl(user);
  });
</script>

<a
  href={resolve(`/u/${user.username}`)}
  class="bg-muted flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
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
</a>
