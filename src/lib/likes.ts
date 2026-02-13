import { pb } from "$lib/pocketbase";
import type { LikesResponse } from "$lib/pocketbase-typegen";

interface WithId {
  id: string;
}

export async function getLikedPostIdsForPosts(
  userId: string,
  posts: WithId[],
  requestKey?: string,
) {
  if (posts.length === 0) return [] as string[];

  const likesFilter = posts.map((post) => `post = "${post.id}"`).join(" || ");
  const likes = await pb.collection("likes").getFullList<LikesResponse>({
    filter: `user = "${userId}" && (${likesFilter})`,
    ...(requestKey ? { requestKey } : {}),
  });

  return likes.map((like) => like.post);
}
