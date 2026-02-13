<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";

  let { title, description, className, icon } = $props<{
    title: string;
    description: string;
    className?: string;
    icon?: Snippet;
  }>();
</script>

<div class={cn("bg-card rounded-xl border p-8 text-center", className)}>
  <div
    class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
  >
    {#if icon}
      {@render icon()}
    {:else}
      <span class="icon-[lucide--image] text-muted-foreground h-6 w-6"></span>
    {/if}
  </div>
  <h2 class="font-medium">{title}</h2>
  <p class="text-muted-foreground mt-1 text-sm">{description}</p>
</div>
