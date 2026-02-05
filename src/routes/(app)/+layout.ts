import { pb } from "$lib/pocketbase";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => {
  const user = pb?.authStore?.model;

  let pendingRequestsCount = 0;
  if (user) {
    try {
      const result = await pb.collection("follows").getList(1, 1, {
        filter: `following = "${user.id}" && accepted = false`,
        requestKey: "pendingRequests",
      });
      pendingRequestsCount = result.totalItems;
    } catch {
      // Ignore errors
    }
  }

  return {
    user,
    pendingRequestsCount,
  };
};
