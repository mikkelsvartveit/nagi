import type {
  FollowsResponse,
  LikesResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";

export type FollowWithUser = FollowsResponse<{ follower: UsersResponse }>;

export type LikeWithExpand = LikesResponse<{
  user: UsersResponse;
  post: PostsResponse;
}>;

export type NotificationItem =
  | {
      kind: "follow_request";
      id: string;
      created: string;
      request: FollowWithUser;
    }
  | {
      kind: "follow";
      id: string;
      created: string;
      follow: FollowWithUser;
    }
  | {
      kind: "like";
      id: string;
      created: string;
      like: LikeWithExpand;
    };
