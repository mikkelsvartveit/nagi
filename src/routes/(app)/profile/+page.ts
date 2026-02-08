import { pb } from "$lib/pocketbase";
import type {
  LikesResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type PostWithUser = PostsResponse<{ user: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return {
      posts: [] as PostWithUser[],
      followersCount: 0,
      followingCount: 0,
      likedPostIds: [] as string[],
    };
  }

  const [posts, followersResult, followingResult] = await Promise.all([
    pb.collection("posts").getFullList<PostWithUser>({
      filter: `user = "${user.id}"`,
      sort: "-created",
      expand: "user",
      requestKey: "profilePosts",
    }),
    pb.collection("follows").getList(1, 1, {
      filter: `following = "${user.id}" && accepted = true`,
      requestKey: "profileFollowers",
    }),
    pb.collection("follows").getList(1, 1, {
      filter: `follower = "${user.id}" && accepted = true`,
      requestKey: "profileFollowing",
    }),
  ]);

  // Fetch current user's likes for their own posts
  let likedPostIds: string[] = [];
  if (posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const likesFilter = postIds.map((id) => `post = "${id}"`).join(" || ");
    const likes = await pb.collection("likes").getFullList<LikesResponse>({
      filter: `user = "${user.id}" && (${likesFilter})`,
      requestKey: "profileLikes",
    });
    likedPostIds = likes.map((l) => l.post);
  }

  return {
    posts,
    followersCount: followersResult.totalItems,
    followingCount: followingResult.totalItems,
    likedPostIds,
  };
};
