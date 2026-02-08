import { pb } from "$lib/pocketbase";
import type { LayoutLoad } from "./$types";

export const prerender = false;

export const load: LayoutLoad = async () => {
  const user = pb?.authStore?.model;

  let pendingRequestsCount = 0;
  let unreadLikesCount = 0;
  let unreadFollowsCount = 0;

  if (user) {
    try {
      const [requestsResult, likesResult, followsResult] = await Promise.all([
        // Pending follow requests
        pb.collection("follows").getList(1, 1, {
          filter: `following = "${user.id}" && accepted = false`,
          requestKey: "pendingRequests",
        }),
        // Unread likes on user's posts
        pb.collection("likes").getList(1, 1, {
          filter: `post.user = "${user.id}" && read = false`,
          requestKey: "unreadLikes",
        }),
        // Unread accepted follows
        pb.collection("follows").getList(1, 1, {
          filter: `following = "${user.id}" && accepted = true && read = false`,
          requestKey: "unreadFollows",
        }),
      ]);
      pendingRequestsCount = requestsResult.totalItems;
      unreadLikesCount = likesResult.totalItems;
      unreadFollowsCount = followsResult.totalItems;
    } catch {
      // Ignore errors
    }
  }

  return {
    user,
    notificationBadgeCount:
      pendingRequestsCount + unreadLikesCount + unreadFollowsCount,
  };
};
