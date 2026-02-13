<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button } from "$lib/components/ui/button";
</script>

<svelte:head>
  <title>Nagi - Back-to-basics social media platform</title>
  <meta
    name="description"
    content="A simple social media platform for sharing photos with close friends."
  />
  <meta
    property="og:title"
    content="Nagi - Back-to-basics social media platform"
  />
  <meta
    property="og:description"
    content="A simple social media platform for sharing photos with close friends."
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="Nagi - Back-to-basics social media platform"
  />
  <meta
    name="twitter:description"
    content="A simple social media platform for sharing photos with close friends."
  />
</svelte:head>

<div class="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
  <div class="w-full max-w-md text-center">
    <!-- Logo/Brand -->
    <div class="mb-8">
      <div
        class="bg-primary mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
      >
        <span class="icon-[lucide--image] text-primary-foreground h-10 w-10"
        ></span>
      </div>
      <h1 class="mb-3 text-4xl font-bold tracking-tight">Nagi</h1>
      <p class="text-muted-foreground text-lg">
        Back-to-basics social media platform
      </p>
    </div>

    <!-- CTA Buttons -->
    <div class="flex flex-col gap-3">
      <Button href={resolve("/register")} class="w-full" size="lg">
        Create account
      </Button>
      <Button
        href={resolve("/login")}
        variant="outline"
        class="w-full"
        size="lg"
      >
        Sign in
      </Button>
    </div>
  </div>
</div>
