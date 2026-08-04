<script lang="ts">
  let {
    size = "md",
    showTagline = true,
    tagline,
  } = $props<{
    size?: "sm" | "md" | "lg";
    showTagline?: boolean;
    tagline?: string;
  }>();

  const iconSize = $derived(
    size === "sm" ? "h-16 w-16" : size === "lg" ? "h-20 w-20" : "h-16 w-16",
  );
  const iconInner = $derived(
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-8 w-8",
  );
  const titleClass = $derived(
    size === "sm" ? "text-2xl" : size === "lg" ? "text-4xl" : "text-2xl",
  );
</script>

<div class="mb-8 text-center">
  <div
    class="bg-primary mx-auto mb-4 flex {iconSize} items-center justify-center rounded-2xl"
  >
    <span class="icon-[lucide--image] text-primary-foreground {iconInner}"
    ></span>
  </div>
  <h1 class="{titleClass} font-bold tracking-tight">Nagi</h1>
  {#if showTagline}
    <p class="text-muted-foreground mt-1 text-sm">
      {tagline ?? "Back-to-basics social media platform"}
    </p>
  {/if}
</div>
