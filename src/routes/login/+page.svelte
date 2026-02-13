<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Card from "$lib/components/ui/card";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    error = "";

    if (!email || !password) {
      error = "Please fill in all fields";
      return;
    }

    loading = true;

    try {
      await pb.collection("users").authWithPassword(email, password);
      goto(resolve("/"));
    } catch {
      error = "Invalid email or password";
    } finally {
      loading = false;
    }
  };
</script>

<svelte:head>
  <title>Sign in - Nagi</title>
  <meta name="description" content="Sign in to your Nagi account" />
  <meta property="og:title" content="Sign in - Nagi" />
  <meta property="og:description" content="Sign in to your Nagi account" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Sign in - Nagi" />
  <meta name="twitter:description" content="Sign in to your Nagi account" />
</svelte:head>

<div class="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
  <div class="w-full max-w-sm">
    <!-- Logo/Brand -->
    <div class="mb-8 text-center">
      <div
        class="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
      >
        <span class="icon-[lucide--image] text-primary-foreground h-8 w-8"
        ></span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p class="text-muted-foreground mt-1 text-sm">
        Sign in to your Nagi account
      </p>
    </div>

    <!-- Login Form -->
    <Card.Root>
      <Card.Content class="pt-2">
        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              bind:value={email}
              autocomplete="email"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              bind:value={password}
              autocomplete="current-password"
              required
            />
          </div>

          {#if error}
            <div
              class="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
            >
              {error}
            </div>
          {/if}

          <Button type="submit" class="w-full" disabled={loading}>
            {#if loading}
              <span class="icon-[lucide--loader-2] mr-2 h-4 w-4 animate-spin"
              ></span>
              Signing in...
            {:else}
              Sign in
            {/if}
          </Button>
        </form>
      </Card.Content>
    </Card.Root>

    <!-- Register Link -->
    <p class="text-muted-foreground mt-6 text-center text-sm">
      Don't have an account?
      <a
        href={resolve("/register")}
        class="text-primary font-medium hover:underline"
      >
        Sign up
      </a>
    </p>
  </div>
</div>
