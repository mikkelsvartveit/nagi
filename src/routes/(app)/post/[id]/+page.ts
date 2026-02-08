import { pb } from "$lib/pocketbase";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type {
  LikesResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";

type PostWithUser = PostsResponse<{ user: UsersResponse }>;

export const load: PageLoad = async ({ params }) => {
  const user = pb?.authStore?.model;

  try {
    const post = await pb.collection("posts").getOne<PostWithUser>(params.id, {
      expand: "user",
    });

    // Check if current user liked this post
    let likedPostIds: string[] = [];
    if (user) {
      try {
        await pb
          .collection("likes")
          .getFirstListItem<LikesResponse>(
            `user = "${user.id}" && post = "${post.id}"`,
          );
        likedPostIds = [post.id];
      } catch {
        // Not liked
      }
    }

    return {
      post,
      likedPostIds,
    };
  } catch {
    error(404, "Post not found");
  }
};
