<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import type { ItemsResponse } from "$lib/pocketbase-typegen";

  let { data } = $props();
  const { user } = $derived(data);

  let items = $state<ItemsResponse[]>([]);
  let newItemText = $state("");
  let loading = $state(false);
  let error = $state("");

  // Fetch list items when user is logged in
  $effect(() => {
    if (user) {
      fetchItems();
    }
  });

  async function fetchItems() {
    try {
      loading = true;
      error = "";
      const records = await pb.collection("items").getFullList({
        sort: "-created",
      });
      items = records;
    } catch (e) {
      error = "Failed to load items";
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function addItem(e: SubmitEvent) {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      const record = await pb.collection("items").create({
        text: newItemText.trim(),
        user: user?.id,
      });
      items = [record, ...items];
      newItemText = "";
    } catch (e) {
      error = "Failed to add item";
      console.error(e);
    }
  }

  async function deleteItem(id: string) {
    try {
      await pb.collection("items").delete(id);
      items = items.filter((item) => item.id !== id);
    } catch (e) {
      error = "Failed to delete item";
      console.error(e);
    }
  }

  const logOut = async () => {
    pb.authStore.clear();
    await invalidateAll();
  };
</script>

<h1 class="text-3xl">Svelte + PocketBase template app</h1>

{#if user}
  <p class="py-4 text-lg">
    <span>Logged in as <span class="font-semibold">{user?.email}</span></span>
  </p>

  <Button onclick={logOut}>Sign out</Button>

  <div class="mt-8 max-w-md">
    <h2 class="mb-4 text-xl font-semibold">My list</h2>

    {#if error}
      <p class="mb-4 text-red-500">{error}</p>
    {/if}

    <form onsubmit={addItem} class="mb-4 flex gap-2">
      <Input
        type="text"
        placeholder="Add a new item..."
        bind:value={newItemText}
        class="flex-1"
      />
      <Button type="submit">Add</Button>
    </form>

    {#if loading}
      <p class="text-muted-foreground">Loading...</p>
    {:else if items.length === 0}
      <p class="text-muted-foreground">No items yet. Add one above!</p>
    {:else}
      <ul class="space-y-2">
        {#each items as item (item.id)}
          <li class="flex items-center justify-between rounded-md border p-3">
            <span>{item.text}</span>
            <Button
              variant="destructive"
              size="sm"
              onclick={() => deleteItem(item.id)}
            >
              Delete
            </Button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{:else}
  <p class="py-8 text-lg">
    <span>You are not signed in.</span>
  </p>

  <p class="flex gap-2 text-lg">
    <Button href="/login">Sign in</Button>
    <Button href="/register">Sign up</Button>
  </p>
{/if}
