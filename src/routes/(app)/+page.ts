import { pb } from "$lib/pocketbase";
import type {
  FollowsResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type PostWithUser = PostsResponse<{ user: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return { posts: [] as PostWithUser[] };
  }

  // Get all users the current user follows (accepted follows only)
  const follows = await pb.collection("follows").getFullList<FollowsResponse>({
    filter: `follower = "${user.id}" && accepted = true`,
    requestKey: "feedFollows",
  });

  // If not following anyone, return empty feed
  if (follows.length === 0) {
    return { posts: [] as PostWithUser[] };
  }

  // Build filter for posts from followed users
  const followedUserIds = follows.map((f) => f.following);
  const userFilter = followedUserIds.map((id) => `user = "${id}"`).join(" || ");

  // Fetch posts from followed users
  const posts = await pb.collection("posts").getFullList<PostWithUser>({
    filter: userFilter,
    sort: "-created",
    expand: "user",
    requestKey: "feedPosts",
  });

  return {
    posts,
  };
};
