<script lang="ts">
  import { untrack } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import { pb } from "$lib/pocketbase";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import type { PostsResponse } from "$lib/pocketbase-typegen";

  let {
    post,
    open = $bindable(false),
  }: {
    post: PostsResponse;
    open?: boolean;
  } = $props();

  let caption = $state("");
  let location = $state("");
  let saving = $state(false);
  let error = $state<string | null>(null);

  const hasChanges = $derived(
    caption.trim() !== post.caption || location.trim() !== post.location,
  );

  // Reset the form to the post's current values each time the dialog opens
  $effect(() => {
    if (!open) return;
    untrack(() => {
      caption = post.caption;
      location = post.location;
      error = null;
    });
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!hasChanges || saving) return;

    saving = true;
    error = null;
    try {
      await pb.collection("posts").update(post.id, {
        caption: caption.trim(),
        location: location.trim(),
      });
      await invalidateAll();
      open = false;
    } catch (err) {
      console.error("Failed to update post:", err);
      error = "Failed to save changes. Please try again.";
    } finally {
      saving = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <form onsubmit={handleSubmit} class="space-y-4">
      <Dialog.Header>
        <Dialog.Title>Edit post</Dialog.Title>
      </Dialog.Header>

      <div class="space-y-2">
        <Label for="edit-caption-{post.id}">Caption</Label>
        <Textarea
          id="edit-caption-{post.id}"
          bind:value={caption}
          placeholder="Write a caption..."
          rows={3}
          disabled={saving}
        />
      </div>

      <div class="space-y-2">
        <Label for="edit-location-{post.id}">Location</Label>
        <Input
          id="edit-location-{post.id}"
          type="text"
          bind:value={location}
          placeholder="Add location"
          disabled={saving}
        />
      </div>

      {#if error}
        <p class="text-destructive text-sm">{error}</p>
      {/if}

      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onclick={() => (open = false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !hasChanges}>
          {#if saving}
            <span class="icon-[lucide--loader-2] mr-2 h-4 w-4 animate-spin"
            ></span>
            Saving...
          {:else}
            Save
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
