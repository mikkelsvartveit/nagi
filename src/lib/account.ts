import { strToU8, zipSync, type Zippable } from "fflate";
import { ClientResponseError } from "pocketbase";
import { pb } from "$lib/pocketbase";
import type {
  FollowsResponse,
  LikesResponse,
  PostsResponse,
  UsersResponse,
} from "$lib/pocketbase-typegen";

const EXPORT_FORMAT_VERSION = 1;

type FollowWithUsers = FollowsResponse<{
  follower?: UsersResponse;
  following?: UsersResponse;
}>;
type LikeWithPost = LikesResponse<{
  post?: PostsResponse<{ user?: UsersResponse }>;
}>;

async function fetchFile(
  record: { id: string; collectionId: string; collectionName: string },
  filename: string,
) {
  const response = await fetch(pb.files.getURL(record, filename));
  if (!response.ok) {
    throw new Error(`Failed to download ${filename} (${response.status})`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Collects everything we store about the given user (profile, posts with
 * original images, likes and follow relationships) into a ZIP archive.
 */
export async function buildAccountExport(user: UsersResponse) {
  const [posts, likes, follows] = await Promise.all([
    pb.collection("posts").getFullList<PostsResponse>({
      filter: pb.filter("user = {:id}", { id: user.id }),
      sort: "created",
      requestKey: "export_posts",
    }),
    pb.collection("likes").getFullList<LikeWithPost>({
      filter: pb.filter("user = {:id}", { id: user.id }),
      sort: "created",
      expand: "post.user",
      requestKey: "export_likes",
    }),
    pb.collection("follows").getFullList<FollowWithUsers>({
      filter: pb.filter("follower = {:id} || following = {:id}", {
        id: user.id,
      }),
      sort: "created",
      expand: "follower,following",
      requestKey: "export_follows",
    }),
  ]);

  const root = `nagi-export-${user.username}`;
  // Images are already compressed, so store them as-is (level 0).
  const files: Zippable = {};

  let avatarPath: string | null = null;
  if (user.avatar) {
    avatarPath = `avatar/${user.avatar}`;
    files[`${root}/${avatarPath}`] = [
      await fetchFile(user, user.avatar),
      { level: 0 },
    ];
  }

  const exportedPosts = await Promise.all(
    posts.map(async (post) => {
      const imagePaths = await Promise.all(
        post.images.map(async (filename) => {
          const path = `posts/${post.id}/${filename}`;
          files[`${root}/${path}`] = [
            await fetchFile(post, filename),
            { level: 0 },
          ];
          return path;
        }),
      );
      return {
        id: post.id,
        caption: post.caption,
        location: post.location,
        images: imagePaths,
        created: post.created,
        updated: post.updated,
      };
    }),
  );

  const describeFollow = (follow: FollowWithUsers, other?: UsersResponse) => ({
    username: other?.username ?? null,
    accepted: follow.accepted,
    created: follow.created,
  });

  const data = {
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    profile: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      isPublic: user.isPublic,
      avatar: avatarPath,
      created: user.created,
      updated: user.updated,
    },
    posts: exportedPosts,
    likes: likes.map((like) => ({
      postId: like.post,
      postAuthor: like.expand?.post?.expand?.user?.username ?? null,
      created: like.created,
    })),
    following: follows
      .filter((follow) => follow.follower === user.id)
      .map((follow) => describeFollow(follow, follow.expand?.following)),
    followers: follows
      .filter((follow) => follow.following === user.id)
      .map((follow) => describeFollow(follow, follow.expand?.follower)),
  };

  files[`${root}/data.json`] = strToU8(JSON.stringify(data, null, 2));

  return {
    filename: `${root}-${data.exportedAt.slice(0, 10)}.zip`,
    blob: new Blob([zipSync(files)], { type: "application/zip" }),
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export class IncorrectPasswordError extends Error {
  constructor() {
    super("Incorrect password");
  }
}

/**
 * Permanently deletes the user's account after re-verifying their password.
 *
 * Posts, likes and follows are removed server-side via PocketBase cascade
 * delete on their relation fields; uploaded files are removed with the records.
 */
export async function deleteAccount(user: UsersResponse, password: string) {
  try {
    await pb.collection("users").authWithPassword(user.email, password);
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 400) {
      throw new IncorrectPasswordError();
    }
    throw error;
  }

  await pb.collection("users").delete(user.id);
  pb.authStore.clear();
}
