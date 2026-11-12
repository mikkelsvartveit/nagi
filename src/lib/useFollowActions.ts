import { invalidateAll } from "$app/navigation";
import { pb } from "$lib/pocketbase";
import type { UsersResponse } from "$lib/pocketbase-typegen";

/**
 * Follow a user. Public profiles are auto-accepted; private profiles get a
 * pending request (the server's createRule rejects `accepted: true` for them).
 * Reloads page data afterwards so follow/requested state comes from the server.
 */
export async function followUser(
  target: Pick<UsersResponse, "id" | "isPublic">,
): Promise<void> {
  const currentUser = pb.authStore.model;
  if (!currentUser) throw new Error("Not authenticated");

  await pb.collection("follows").create({
    follower: currentUser.id,
    following: target.id,
    accepted: target.isPublic,
  });

  await invalidateAll();
}
