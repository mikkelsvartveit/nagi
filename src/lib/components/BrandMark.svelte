<script lang="ts">
  let { title, tagline } = $props<{
    title: string;
    tagline?: string;
  }>();
</script>

<div class="mb-8 text-center">
  <div
    class="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
  >
    <span class="icon-[lucide--image] text-primary-foreground h-8 w-8"></span>
  </div>
  <h1 class="text-2xl font-bold tracking-tight">{title}</h1>
  {#if tagline}
    <p class="text-muted-foreground mt-1 text-sm">{tagline}</p>
  {/if}
</div>
