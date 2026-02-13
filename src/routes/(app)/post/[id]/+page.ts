import { getLikedPostIdsForPosts } from "$lib/likes";
import { pb } from "$lib/pocketbase";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";

export const load: PageLoad = async ({ params }) => {
  const user = pb?.authStore?.model;

  try {
    const post = await pb
      .collection("posts")
      .getOne<PostsResponse<{ user: UsersResponse }>>(params.id, {
        expand: "user",
      });

    const likedPostIds = user
      ? await getLikedPostIdsForPosts(user.id, [post], "singlePostLikes")
      : [];

    return {
      post,
      likedPostIds,
    };
  } catch {
    error(404, "Post not found");
  }
};
