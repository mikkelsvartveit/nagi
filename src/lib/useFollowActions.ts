import { invalidateAll } from "$app/navigation";
import { pb } from "$lib/pocketbase";
import type { UsersResponse } from "$lib/pocketbase-typegen";

/**
 * Follow a user — creates a follow record. Auto-accepts if the target has a public profile.
 * Returns the target user's ID on success.
 */
export async function followUser(userId: string): Promise<string> {
  const currentUser = pb.authStore.model;
  if (!currentUser) throw new Error("Not authenticated");

  const targetUser = await pb.collection("users").getOne<UsersResponse>(userId);

  await pb.collection("follows").create({
    follower: currentUser.id,
    following: userId,
    accepted: targetUser.isPublic ? true : false,
  });

  await invalidateAll();
  return userId;
}
