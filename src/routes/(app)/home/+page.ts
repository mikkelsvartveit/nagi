import { getLikedPostIdsForPosts } from "$lib/likes";
import { pb } from "$lib/pocketbase";
import type {
  FollowsResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return {
      posts: [] as PostsResponse<{ user: UsersResponse }>[],
      likedPostIds: [] as string[],
    };
  }

  // Get all users the current user follows (accepted follows only)
  const follows = await pb.collection("follows").getFullList<FollowsResponse>({
    filter: `follower = "${user.id}" && accepted = true`,
    requestKey: "feedFollows",
  });

  // Build filter for posts from followed users + own posts
  const followedUserIds = follows.map((f) => f.following);
  const allUserIds = [user.id, ...followedUserIds];
  const userFilter = allUserIds.map((id) => `user = "${id}"`).join(" || ");

  // Fetch posts from followed users and self (capped at 50 most recent)
  const postsResult = await pb
    .collection("posts")
    .getList<PostsResponse<{ user: UsersResponse }>>(1, 50, {
      filter: userFilter,
      sort: "-created",
      expand: "user",
      requestKey: "feedPosts",
    });

  // Batch-fetch current user's likes for all feed posts
  const likedPostIds = await getLikedPostIdsForPosts(
    user.id,
    postsResult.items,
    "feedLikes",
  );

  return {
    posts: postsResult.items,
    likedPostIds,
  };
};
