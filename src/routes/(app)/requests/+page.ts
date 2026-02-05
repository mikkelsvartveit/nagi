import { pb } from "$lib/pocketbase";
import type { FollowsResponse, UsersResponse } from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type FollowWithUser = FollowsResponse<{ follower: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return { pendingRequests: [] as FollowWithUser[] };
  }

  // Get pending follow requests where the current user is being followed
  const pendingRequests = await pb
    .collection("follows")
    .getFullList<FollowWithUser>({
      filter: `following = "${user.id}" && accepted = false`,
      sort: "-created",
      expand: "follower",
    });

  return {
    pendingRequests,
  };
};
