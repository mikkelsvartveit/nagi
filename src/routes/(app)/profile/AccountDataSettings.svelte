<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    buildAccountExport,
    deleteAccount,
    downloadBlob,
    IncorrectPasswordError,
  } from "$lib/account";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { UsersResponse } from "$lib/pocketbase-typegen";

  let { user }: { user: UsersResponse } = $props();

  let exporting = $state(false);
  let exportError = $state("");

  let deleteDialogOpen = $state(false);
  let deleting = $state(false);
  let deletePassword = $state("");
  let deleteError = $state("");

  async function handleExport() {
    exporting = true;
    exportError = "";
    try {
      const { blob, filename } = await buildAccountExport(user);
      downloadBlob(blob, filename);
    } catch (error) {
      console.error("Failed to export account data:", error);
      exportError = "Couldn't prepare your export. Please try again.";
    } finally {
      exporting = false;
    }
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (!open) {
      deletePassword = "";
      deleteError = "";
    }
  }

  async function handleDelete(e: SubmitEvent) {
    e.preventDefault();
    if (!deletePassword) {
      deleteError = "Enter your password to confirm";
      return;
    }

    deleting = true;
    deleteError = "";
    try {
      await deleteAccount(user, deletePassword);
      deleteDialogOpen = false;
      await goto(resolve("/login"));
    } catch (error) {
      if (error instanceof IncorrectPasswordError) {
        deleteError = "Incorrect password";
      } else {
        console.error("Failed to delete account:", error);
        deleteError = "Couldn't delete your account. Please try again.";
      }
    } finally {
      deleting = false;
    }
  }
</script>

<div class="bg-card mt-4 rounded-xl border p-4">
  <p class="font-medium">Your data</p>

  <div class="mt-4 flex items-center justify-between gap-4">
    <div>
      <p class="text-sm font-medium">Download your data</p>
      <p class="text-muted-foreground text-sm">
        Your profile, posts, photos, likes and follows as a ZIP file
      </p>
    </div>
    <Button
      variant="outline"
      size="sm"
      onclick={handleExport}
      disabled={exporting}
    >
      {exporting ? "Preparing..." : "Download"}
    </Button>
  </div>
  {#if exportError}
    <p class="text-destructive mt-2 text-sm" role="alert">{exportError}</p>
  {/if}

  <div class="mt-4 flex items-center justify-between gap-4 border-t pt-4">
    <div>
      <p class="text-sm font-medium">Delete account</p>
      <p class="text-muted-foreground text-sm">
        Permanently remove your account and all your data
      </p>
    </div>
    <Button
      variant="destructive"
      size="sm"
      onclick={() => (deleteDialogOpen = true)}
    >
      Delete
    </Button>
  </div>
</div>

<AlertDialog.Root
  bind:open={deleteDialogOpen}
  onOpenChange={handleDeleteDialogOpenChange}
>
  <AlertDialog.Content>
    <form onsubmit={handleDelete} class="grid gap-4">
      <AlertDialog.Header>
        <AlertDialog.Title>Delete your account?</AlertDialog.Title>
        <AlertDialog.Description>
          This permanently deletes your profile, posts, photos, likes and
          follows. This cannot be undone. You may want to download your data
          first.
        </AlertDialog.Description>
      </AlertDialog.Header>

      <div class="space-y-2">
        <Label for="delete-account-password">Confirm with your password</Label>
        <Input
          id="delete-account-password"
          type="password"
          autocomplete="current-password"
          bind:value={deletePassword}
          disabled={deleting}
          aria-invalid={deleteError ? true : undefined}
        />
        {#if deleteError}
          <p class="text-destructive text-sm" role="alert">{deleteError}</p>
        {/if}
      </div>

      <AlertDialog.Footer>
        <AlertDialog.Cancel type="button" disabled={deleting}>
          Cancel
        </AlertDialog.Cancel>
        <Button type="submit" variant="destructive" disabled={deleting}>
          {deleting ? "Deleting..." : "Delete account"}
        </Button>
      </AlertDialog.Footer>
    </form>
  </AlertDialog.Content>
</AlertDialog.Root>
