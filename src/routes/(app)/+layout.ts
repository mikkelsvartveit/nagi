import { resolve } from "$app/paths";
import { redirect } from "@sveltejs/kit";
import { pb } from "$lib/pocketbase";
import type { LayoutLoad } from "./$types";

export const prerender = false;

export const load: LayoutLoad = async () => {
  if (pb.authStore.isValid) {
    try {
      await pb.collection("users").authRefresh();
    } catch {
      pb.authStore.clear();
    }
  } else if (pb.authStore.token) {
    pb.authStore.clear();
  }

  const user = pb.authStore.isValid ? pb.authStore.model : null;

  if (!user) {
    redirect(307, resolve("/login"));
  }

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
    } catch (err) {
      console.error("Failed to load notification counts:", err);
    }
  }

  return {
    user,
    notificationBadgeCount:
      pendingRequestsCount + unreadLikesCount + unreadFollowsCount,
  };
};
