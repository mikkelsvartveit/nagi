import { pb } from "$lib/pocketbase";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";

type PostWithUser = PostsResponse<{ user: UsersResponse }>;

export const load: PageLoad = async ({ params }) => {
  try {
    const post = await pb.collection("posts").getOne<PostWithUser>(params.id, {
      expand: "user",
    });

    return {
      post,
    };
  } catch {
    error(404, "Post not found");
  }
};
