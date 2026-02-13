<script lang="ts">
  import { resolve } from "$app/paths";

  let { onLogout } = $props<{ onLogout: () => Promise<void> }>();

  function handleHeaderClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
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
        onclick={onLogout}
        class="text-muted-foreground hover:text-foreground flex items-center justify-center p-2"
        aria-label="Sign out"
      >
        <span class="icon-[lucide--log-out] inline-block h-5 w-5 shrink-0"
        ></span>
      </button>
    </div>
  </div>
</header>
