import { pb } from "$lib/pocketbase";
import type {
  FollowsResponse,
  LikesResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type PostWithUser = PostsResponse<{ user: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return { posts: [] as PostWithUser[], likedPostIds: [] as string[] };
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

  // Fetch posts from followed users and self
  const posts = await pb.collection("posts").getFullList<PostWithUser>({
    filter: userFilter,
    sort: "-created",
    expand: "user",
    requestKey: "feedPosts",
  });

  // Batch-fetch current user's likes for all feed posts
  let likedPostIds: string[] = [];
  if (posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const likesFilter = postIds.map((id) => `post = "${id}"`).join(" || ");
    const likes = await pb.collection("likes").getFullList<LikesResponse>({
      filter: `user = "${user.id}" && (${likesFilter})`,
      requestKey: "feedLikes",
    });
    likedPostIds = likes.map((l) => l.post);
  }

  return {
    posts,
    likedPostIds,
  };
};
