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

<div class="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
  <div class="w-full max-w-sm">
    <!-- Logo/Brand -->
    <div class="mb-8 text-center">
      <div
        class="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-primary-foreground h-8 w-8"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
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
              <svg
                class="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
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
