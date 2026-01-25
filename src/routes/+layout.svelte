<script>
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1"
  />
</svelte:head>

<div class="bg-background min-h-dvh">
  {@render children()}
</div>
