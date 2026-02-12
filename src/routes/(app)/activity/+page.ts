import { pb } from "$lib/pocketbase";
import type {
  FollowsResponse,
  LikesResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

export type FollowWithUser = FollowsResponse<{ follower: UsersResponse }>;
export type LikeWithExpand = LikesResponse<{
  user: UsersResponse;
  post: PostsResponse;
}>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return {
      pendingRequests: [] as FollowWithUser[],
      recentFollows: [] as FollowWithUser[],
      recentLikes: [] as LikeWithExpand[],
      followingIds: [] as string[],
    };
  }

  const [
    pendingRequests,
    recentFollows,
    recentLikes,
    following,
    pendingFollowing,
  ] = await Promise.all([
    // Pending follow requests (not yet accepted) - incoming
    pb.collection("follows").getFullList<FollowWithUser>({
      filter: `following = "${user.id}" && accepted = false`,
      sort: "-created",
      expand: "follower",
    }),

    // Recent accepted follows (these are "started following you" notifications)
    pb.collection("follows").getFullList<FollowWithUser>({
      filter: `following = "${user.id}" && accepted = true`,
      sort: "-created",
      expand: "follower",
      requestKey: "recentFollows",
    }),

    // Recent likes on user's posts
    pb.collection("likes").getFullList<LikeWithExpand>({
      filter: `post.user = "${user.id}"`,
      sort: "-created",
      expand: "user,post",
      requestKey: "recentLikes",
    }),

    // All accepted follows by the current user (for "follow back" status)
    pb.collection("follows").getFullList<FollowsResponse>({
      filter: `follower = "${user.id}" && accepted = true`,
      requestKey: "notificationsFollowingCheck",
    }),

    // Pending outgoing follow requests by the current user
    pb.collection("follows").getFullList<FollowsResponse>({
      filter: `follower = "${user.id}" && accepted = false`,
      requestKey: "pendingFollowingCheck",
    }),
  ]);

  const followingIds = following.map((f) => f.following);
  const pendingFollowingIds = pendingFollowing.map((f) => f.following);

  // Collect IDs of unread items so the page component can mark them as read
  const unreadLikeIds = recentLikes.filter((l) => !l.read).map((l) => l.id);
  const unreadFollowIds = recentFollows.filter((f) => !f.read).map((f) => f.id);

  return {
    pendingRequests,
    recentFollows,
    recentLikes,
    followingIds,
    pendingFollowingIds,
    unreadLikeIds,
    unreadFollowIds,
  };
};
