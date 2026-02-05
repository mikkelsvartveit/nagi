import { pb } from "$lib/pocketbase";
import type { FollowsResponse, UsersResponse } from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type FollowWithUser = FollowsResponse<{ following: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return { following: [] as FollowWithUser[] };
  }

  // Get all users the current user follows (accepted only)
  const following = await pb.collection("follows").getFullList<FollowWithUser>({
    filter: `follower = "${user.id}" && accepted = true`,
    expand: "following",
    requestKey: "followingList",
  });

  return {
    following,
  };
};
