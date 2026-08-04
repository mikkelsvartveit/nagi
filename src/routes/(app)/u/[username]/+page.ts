import { getLikedPostIdsForPosts } from "$lib/likes";
import { pb } from "$lib/pocketbase";
import type {
  FollowsResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const currentUser = pb?.authStore?.model;

  // Get the profile user by username
  let profileUser: UsersResponse;
  try {
    profileUser = await pb
      .collection("users")
      .getFirstListItem<UsersResponse>(`username = "${params.username}"`);
  } catch {
    return {
      profileUser: null,
      posts: [] as PostsResponse<{ user: UsersResponse }>[],
      followStatus: null,
      isOwnProfile: false,
      likedPostIds: [] as string[],
    };
  }

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser?.id === profileUser.id;

  // Get the follow relationship between current user and profile user
  let followStatus: FollowsResponse | null = null;
  if (currentUser && !isOwnProfile) {
    try {
      followStatus = await pb
        .collection("follows")
        .getFirstListItem<FollowsResponse>(
          `follower = "${currentUser.id}" && following = "${profileUser.id}"`,
        );
    } catch {
      // No follow relationship exists
      followStatus = null;
    }
  }

  // Get posts only if:
  // 1. It's the user's own profile, OR
  // 2. The profile is public, OR
  // 3. The current user follows the profile user and it's accepted
  const canViewPosts =
    isOwnProfile ||
    profileUser.isPublic ||
    (followStatus && followStatus.accepted);

  let posts: PostsResponse<{ user: UsersResponse }>[] = [];
  let likedPostIds: string[] = [];

  if (canViewPosts) {
    const postsResult = await pb
      .collection("posts")
      .getList<PostsResponse<{ user: UsersResponse }>>(1, 50, {
        filter: `user = "${profileUser.id}"`,
        sort: "-created",
        expand: "user",
      });

    // Fetch current user's likes for these posts
    if (currentUser) {
      likedPostIds = await getLikedPostIdsForPosts(
        currentUser.id,
        postsResult.items,
        "userProfileLikes",
      );
    }

    posts = postsResult.items;
  }

  return {
    profileUser,
    posts,
    followStatus,
    isOwnProfile,
    likedPostIds,
  };
};
