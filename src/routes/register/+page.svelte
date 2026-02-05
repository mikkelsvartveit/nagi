<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pb } from "$lib/pocketbase";
  import type { PocketBaseError } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Card from "$lib/components/ui/card";

  let username = $state("");
  let name = $state("");
  let email = $state("");
  let password = $state("");
  let passwordConfirm = $state("");
  let loading = $state(false);

  interface FieldErrors {
    username?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
    general?: string;
  }

  let errors = $state<FieldErrors>({});

  const validateUsername = (value: string): string | undefined => {
    if (!value) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value))
      return "Username can only contain letters, numbers, and underscores";
    return undefined;
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    errors = {};

    // Validate fields
    const usernameError = validateUsername(username);
    if (usernameError) errors.username = usernameError;
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    else if (password.length < 8)
      errors.password = "Password must be at least 8 characters";
    if (password !== passwordConfirm)
      errors.passwordConfirm = "Passwords do not match";

    if (Object.keys(errors).length > 0) return;

    loading = true;

    try {
      await pb.collection("users").create({
        username,
        name: name || undefined,
        email,
        password,
        passwordConfirm,
      });

      await pb.collection("users").authWithPassword(email, password);
      goto(resolve("/"));
    } catch (err) {
      if (err instanceof Error && "originalError" in err) {
        const pbError = err.originalError as PocketBaseError;
        // Map PocketBase field errors to our error state
        if (pbError.data?.username) {
          errors.username = pbError.data.username.message;
        }
        if (pbError.data?.email) {
          errors.email = pbError.data.email.message;
        }
        if (pbError.data?.password) {
          errors.password = pbError.data.password.message;
        }
        if (pbError.data?.passwordConfirm) {
          errors.passwordConfirm = pbError.data.passwordConfirm.message;
        }
        if (Object.keys(errors).length === 0) {
          errors.general = "Something went wrong. Please try again.";
        }
      } else {
        errors.general = "Something went wrong. Please try again.";
      }
    } finally {
      loading = false;
    }
  };
</script>

<svelte:head>
  <title>Create account - Nagi</title>
  <meta
    name="description"
    content="Create a Nagi account and join the back-to-basics social media platform"
  />
  <meta property="og:title" content="Create account - Nagi" />
  <meta
    property="og:description"
    content="Create a Nagi account and join the back-to-basics social media platform"
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Create account - Nagi" />
  <meta
    name="twitter:description"
    content="Create a Nagi account and join the back-to-basics social media platform"
  />
</svelte:head>

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
      <h1 class="text-2xl font-bold tracking-tight">Create an account</h1>
      <p class="text-muted-foreground mt-1 text-sm">Join Nagi today</p>
    </div>

    <!-- Register Form -->
    <Card.Root>
      <Card.Content class="pt-2">
        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <Label for="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="your_username"
              bind:value={username}
              autocomplete="username"
              class={errors.username ? "border-destructive" : ""}
              required
            />
            {#if errors.username}
              <p class="text-destructive text-xs">{errors.username}</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="name"
              >Name <span class="text-muted-foreground font-normal"
                >(optional)</span
              ></Label
            >
            <Input
              id="name"
              type="text"
              placeholder="Your display name"
              bind:value={name}
              autocomplete="name"
            />
            <p class="text-muted-foreground text-xs">
              This shows up as your name on your profile
            </p>
          </div>

          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              bind:value={email}
              autocomplete="email"
              class={errors.email ? "border-destructive" : ""}
              required
            />
            {#if errors.email}
              <p class="text-destructive text-xs">{errors.email}</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              bind:value={password}
              autocomplete="new-password"
              class={errors.password ? "border-destructive" : ""}
              required
            />
            {#if errors.password}
              <p class="text-destructive text-xs">{errors.password}</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="passwordConfirm">Confirm Password</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="Confirm your password"
              bind:value={passwordConfirm}
              autocomplete="new-password"
              class={errors.passwordConfirm ? "border-destructive" : ""}
              required
            />
            {#if errors.passwordConfirm}
              <p class="text-destructive text-xs">{errors.passwordConfirm}</p>
            {/if}
          </div>

          {#if errors.general}
            <div
              class="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
            >
              {errors.general}
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
              Creating account...
            {:else}
              Create account
            {/if}
          </Button>
        </form>
      </Card.Content>
    </Card.Root>

    <!-- Login Link -->
    <p class="text-muted-foreground mt-6 text-center text-sm">
      Already have an account?
      <a
        href={resolve("/login")}
        class="text-primary font-medium hover:underline"
      >
        Sign in
      </a>
    </p>
  </div>
</div>
