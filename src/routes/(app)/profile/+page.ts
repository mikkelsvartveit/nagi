import { pb } from "$lib/pocketbase";
import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

type PostWithUser = PostsResponse<{ user: UsersResponse }>;

export const load: PageLoad = async () => {
  const user = pb?.authStore?.model;

  if (!user) {
    return { posts: [] as PostWithUser[] };
  }

  const posts = await pb.collection("posts").getFullList<PostWithUser>({
    filter: `user = "${user.id}"`,
    sort: "-created",
    expand: "user",
  });

  return {
    posts,
  };
};
