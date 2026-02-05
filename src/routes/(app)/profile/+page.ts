import { pb } from "$lib/pocketbase";
import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type PostWithUser = PostsResponse<{ user: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return {
      posts: [] as PostWithUser[],
      followersCount: 0,
      followingCount: 0,
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

  return {
    posts,
    followersCount: followersResult.totalItems,
    followingCount: followingResult.totalItems,
  };
};
