import { pb } from "$lib/pocketbase";
import type { FollowsResponse, UsersResponse } from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type FollowWithUser = FollowsResponse<{ follower: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return {
      followers: [] as FollowWithUser[],
      followingIds: [] as string[],
      pendingFollowingIds: [] as string[],
    };
  }

  const [followers, following, pendingFollowing] = await Promise.all([
    // Users who follow the current user (accepted only)
    pb.collection("follows").getFullList<FollowWithUser>({
      filter: `following = "${user.id}" && accepted = true`,
      expand: "follower",
      requestKey: "followersList",
    }),
    // Users the current user follows (to check for "follow back" status)
    pb.collection("follows").getFullList<FollowsResponse>({
      filter: `follower = "${user.id}" && accepted = true`,
      requestKey: "followingCheck",
    }),
    // Pending follow requests sent by the current user
    pb.collection("follows").getFullList<FollowsResponse>({
      filter: `follower = "${user.id}" && accepted = false`,
      requestKey: "pendingFollowingCheck",
    }),
  ]);

  const followingIds = following.map((f) => f.following);
  const pendingFollowingIds = pendingFollowing.map((f) => f.following);

  return {
    followers,
    followingIds,
    pendingFollowingIds,
  };
};
