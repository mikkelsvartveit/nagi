import { pb } from "$lib/pocketbase";
import type { FollowsResponse, UsersResponse } from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type FollowWithUser = FollowsResponse<{ follower: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return { followers: [] as FollowWithUser[], followingIds: [] as string[] };
  }

  // Get all users who follow the current user (accepted only)
  const followers = await pb.collection("follows").getFullList<FollowWithUser>({
    filter: `following = "${user.id}" && accepted = true`,
    expand: "follower",
    requestKey: "followersList",
  });

  // Get all users the current user follows (to check for "follow back" status)
  const following = await pb
    .collection("follows")
    .getFullList<FollowsResponse>({
      filter: `follower = "${user.id}" && accepted = true`,
      requestKey: "followingCheck",
    });

  // Get pending follow requests sent by current user
  const pendingFollowing = await pb
    .collection("follows")
    .getFullList<FollowsResponse>({
      filter: `follower = "${user.id}" && accepted = false`,
      requestKey: "pendingFollowingCheck",
    });

  const followingIds = following.map((f) => f.following);
  const pendingFollowingIds = pendingFollowing.map((f) => f.following);

  return {
    followers,
    followingIds,
    pendingFollowingIds,
  };
};
