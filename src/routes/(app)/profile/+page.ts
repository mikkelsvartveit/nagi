import { getLikedPostIdsForPosts } from "$lib/likes";
import { pb } from "$lib/pocketbase";
import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return {
      posts: [] as PostsResponse<{ user: UsersResponse }>[],
      followersCount: 0,
      followingCount: 0,
      likedPostIds: [] as string[],
    };
  }

  const [posts, followersResult, followingResult] = await Promise.all([
    pb.collection("posts").getFullList<PostsResponse<{ user: UsersResponse }>>({
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
  const likedPostIds = await getLikedPostIdsForPosts(
    user.id,
    posts,
    "profileLikes",
  );

  return {
    posts,
    followersCount: followersResult.totalItems,
    followingCount: followingResult.totalItems,
    likedPostIds,
  };
};
