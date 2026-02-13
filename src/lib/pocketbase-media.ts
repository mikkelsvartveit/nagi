import { pb } from "$lib/pocketbase";
import type { PostsResponse, UsersResponse } from "$lib/pocketbase-typegen";

export function getUserAvatarUrl(
  user: UsersResponse | null | undefined,
  thumb: "100x100" | "320x320" = "100x100",
) {
  if (!user?.avatar) return null;
  return pb.files.getURL(user, user.avatar, { thumb });
}

export function getPostThumbnailUrl(
  post: PostsResponse | null | undefined,
  thumb: "100x100" = "100x100",
) {
  if (!post?.images || post.images.length === 0) return null;
  return pb.files.getURL(post, post.images[0], { thumb });
}
