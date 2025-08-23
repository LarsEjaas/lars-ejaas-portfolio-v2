import { AtpAgent } from '@atproto/api';
import type {
  AppBskyFeedSearchPosts,
  AppBskyActorDefs,
  AppBskyFeedDefs,
  AppBskyFeedGetLikes,
} from '@atproto/api';
import {
  mkdirSync,
  createWriteStream,
  writeFileSync,
  existsSync,
  readFileSync,
} from 'fs';
import { extname } from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import crypto from 'crypto';
import 'dotenv/config';
import { notEmpty, type BlueskyPostThread } from './../customTypes/index.ts';
import pLimit from 'p-limit';
import { MAXIMUM_NUMBER_OF_LIKE_AVATARS } from '../components/bluesky/constants.ts';

export const SITE_URL = process.env.SITE_URL
  ? removeTrailingSlash(process.env.SITE_URL)
  : '';

interface ImageMeta {
  hash: string;
  localPath: string;
  fileName: string;
  uri?: string;
  originalUrl?: string;
  alt?: string;
  ext?: string;
  mimeType?: string;
  updatedAt?: string;
}

export type BlueskyData = {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  threads: BlueskyPostThread[];
  host: string;
};

const HANDLE = process.env.BLUESKY_HANDLE;
const META_FOLDER = './src/assets/bluesky';
export const PUBLIC_FOLDER = './public/bluesky';
const IMAGE_META_PATH = `${META_FOLDER}/image-meta.json`;
const PUBLIC_FILENAME = 'devtips-threads.json';
const SEARCH_TAG = 'DeveloperTips';
export const FILE_NAME = 'devtips_data.json';
export const BLUESKY_DATA_PATH = `./src/collections/bluesky/${FILE_NAME}`;
export const PUBLIC_DATA_PATH = `./public/${PUBLIC_FILENAME}`;

/**
 * Remove trailing slash from a slug or url, preserving literal type
 */
function removeTrailingSlash<T extends string>(
  url: T
): T extends `${infer Rest}/` ? Rest : T {
  return (
    url.endsWith('/') ? url.slice(0, -1) : url
  ) as T extends `${infer Rest}/` ? Rest : T;
}

function hashBuffer(buffer: Buffer<ArrayBuffer>) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function loadImageMeta(): Record<string, ImageMeta> {
  if (existsSync(IMAGE_META_PATH)) {
    return JSON.parse(readFileSync(IMAGE_META_PATH, 'utf-8'));
  }
  return {};
}

export function saveImageMeta(meta: Record<string, ImageMeta>) {
  const dir = IMAGE_META_PATH.substring(0, IMAGE_META_PATH.lastIndexOf('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(IMAGE_META_PATH, JSON.stringify(meta, null, 2), 'utf8');
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function saveBlueskyData({
  data,
  imageMeta,
}: {
  data: BlueskyData;
  imageMeta: Record<string, ImageMeta>;
}) {
  const dir = BLUESKY_DATA_PATH.substring(
    0,
    BLUESKY_DATA_PATH.lastIndexOf('/')
  );
  mkdirSync(dir, { recursive: true });
  writeFileSync(BLUESKY_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');

  const publicData = {
    threads: data.threads.map((thread) => ({
      atUri: thread.rootUri,
    })),
    // Include only the images with updatedAt timestamp
    images: Object.fromEntries(
      Object.entries(imageMeta)
        .filter(([_url, meta]) => meta.updatedAt)
        .map(([url, meta]) => [
          url,
          {
            updatedAt: meta.updatedAt,
            localPath: meta.localPath,
          },
        ])
    ),
  };

  const publicDir = PUBLIC_DATA_PATH.substring(
    0,
    PUBLIC_DATA_PATH.lastIndexOf('/')
  );
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(PUBLIC_DATA_PATH, JSON.stringify(publicData, null, 2), 'utf8');
}

export function getImageExtension(url: string): string {
  const parsed = new URL(url);
  const ext = extname(parsed.pathname);
  if (ext) return ext;

  // Fallback: handle @ext in the final segment
  const lastSegment = parsed.pathname.split('/').pop()!;
  const match = lastSegment.match(/@(\w+)$/);
  return match ? `.${match[1]}` : '';
}

export async function downloadImageIfChanged({
  url,
  localName,
  meta = {},
  publicAsset,
  updatedAt,
}: {
  url: string;
  localName: string;
  meta: Record<string, ImageMeta>;
  /** Place the image in the public folder */
  publicAsset?: boolean;
  updatedAt?: string;
}): Promise<string> {
  const ext = getImageExtension(url);
  const fileName = `${localName}${ext}`;
  let localPath = `${META_FOLDER}/${fileName}`;
  if (publicAsset) {
    localPath = `${PUBLIC_FOLDER}/${fileName}`;
    mkdirSync(PUBLIC_FOLDER, { recursive: true });
  }

  mkdirSync(META_FOLDER, { recursive: true });

  const res = await fetch(url);
  await delay(20);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.statusText}`);
  }

  const buffer = await res.arrayBuffer();
  const hash = hashBuffer(Buffer.from(buffer));

  if (url in meta && meta[url]?.hash === hash) {
    return fileName;
  }

  const fileStream = createWriteStream(localPath);
  await pipeline(Readable.from([Buffer.from(buffer)]), fileStream);

  meta[url] = {
    hash,
    localPath: localPath.startsWith('./public')
      ? localPath.replace('./public', '')
      : localPath,
    fileName,
    updatedAt,
  };
  console.info(`✅ bluesky image saved at: ${localPath}`);
  return fileName;
}

export async function getAuthenticateBlueskyAgent(): Promise<AtpAgent> {
  const appPassword = process.env.BLUESKY_APP_PASSWORD;
  if (!HANDLE || !appPassword) {
    throw new Error(
      'BLUESKY_HANDLE and BLUESKY_APP_PASSWORD environment variables must be set'
    );
  }
  const agent = new AtpAgent({ service: 'https://bsky.social' });

  await agent.login({
    identifier: HANDLE,
    password: appPassword,
  });

  return agent;
}

export async function getProfile(
  agent: AtpAgent,
  actor: string
): Promise<AppBskyActorDefs.ProfileViewDetailed> {
  const response = await agent.getProfile({
    actor,
  });

  return response.data;
}

/** Search for posts using structured parameters */
async function searchPosts(
  agent: AtpAgent,
  options: AppBskyFeedSearchPosts.QueryParams
): Promise<AppBskyFeedSearchPosts.OutputSchema> {
  const response = await agent.app.bsky.feed.searchPosts(options);
  return response.data;
}

/** Filter the thread to only include own posts authored by the user
 * AND ensure that replies are part of the thread starting from the root post.
 *
 * This means that replies that are not part of the root thread will be excluded.
 */
async function getOwnThreadOnly(
  thread: AppBskyFeedDefs.ThreadViewPost,
  selfDid: string
) {
  const collected: AppBskyFeedDefs.PostView[] = [];
  const rootUri = thread.post.uri;

  function traverse(node?: AppBskyFeedDefs.ThreadViewPost) {
    // Only collect posts authored by the user
    if (!node || node.post.author.did !== selfDid) return;
    // Only collect posts that are part of the thread starting from the root
    // Ensure no replies are collected that are not part of the root thread
    if (
      node.parent &&
      'post' in node.parent &&
      node.parent.post.uri !== rootUri
    )
      return;
    collected.push(node.post);

    if (Array.isArray(node.replies)) {
      for (const reply of node.replies) {
        if ('post' in reply) {
          traverse(reply);
        }
      }
    }
  }

  traverse(thread);
  return collected;
}

export async function getPostThreads(
  agent: AtpAgent,
  profile: AppBskyActorDefs.ProfileViewDetailed,
  imageMeta: Record<string, ImageMeta>
): Promise<BlueskyPostThread[]> {
  const threads: BlueskyPostThread[] = [];
  const limit = pLimit(3); // max 3 concurrent requests
  let cursor: string | undefined = undefined;

  do {
    const searchResults = await searchPosts(agent, {
      q: `#${SEARCH_TAG}`,
      author: HANDLE,
      limit: 100,
      sort: 'latest',
      tag: [SEARCH_TAG],
      cursor,
    });

    // Fetch posts concurrently but limited
    const threadResults = await Promise.all(
      searchResults.posts.map((post) =>
        limit(async () => {
          // Fetch only the post itself, not the full thread
          const { data: postData } = await agent.app.bsky.feed.getPostThread({
            uri: post.uri,
            depth: 10,
            parentHeight: 0,
          });

          const postItem =
            'post' in postData.thread ? postData.thread : undefined;
          if (!postItem || postItem.post.author.did !== profile.did) return;

          const filtered = await getOwnThreadOnly(postItem, profile.did);

          // Download images (fullsize and thumbnails)
          for (const post of filtered) {
            const recordId = post.uri.split('/').pop();
            if (post.embed && 'images' in post.embed) {
              for (const image of post.embed.images) {
                // place fullsize image in public folder
                await downloadImageIfChanged({
                  url: image.fullsize,
                  localName: `post-${recordId}-embed`,
                  meta: imageMeta,
                  publicAsset: true,
                });
                // place thumbnail image in src folder
                await downloadImageIfChanged({
                  url: image.thumb,
                  localName: `post-${recordId}-embed-thumbnail`,
                  meta: imageMeta,
                });
              }
            }

            if (
              post.embed &&
              'external' in post.embed &&
              post.embed.external.thumb
            ) {
              await downloadImageIfChanged({
                url: post.embed.external.thumb,
                localName: `post-${recordId}-embed`,
                meta: imageMeta,
              });
            }
          }

          const recordKey = postItem.post.uri.split('/').pop() || '';
          return {
            rootUri: postItem.post.uri,
            posts: filtered,
            viewOnBluesky: `https://bsky.app/profile/${profile.handle}/post/${recordKey}`,
            recordKey: `bsky${recordKey}`,
          } satisfies BlueskyPostThread;
        })
      )
    );
    threads.push(...threadResults.filter(notEmpty));

    cursor = searchResults.cursor; // paginate
  } while (cursor);

  return threads;
}

/**
 * Removes duplicate likes from an array by actor DID.
 *
 * Ensures each user is only counted once, even if they liked
 * multiple posts in a thread.
 *
 * @param likes - The array of like objects (each with an actor.did).
 */
function dedupeLikes(likes: AppBskyFeedGetLikes.Like[]) {
  const seen = new Set<string>();
  return likes.filter((like) => {
    if (!like.actor?.did) return false;
    if (seen.has(like.actor.did)) return false;
    seen.add(like.actor.did);
    return true;
  });
}

export async function getLikes({
  agent,
  threads,
  oldThreads,
  imageMeta,
  updateAll = false,
}: {
  agent: AtpAgent;
  threads: BlueskyPostThread[];
  oldThreads: BlueskyPostThread[];
  imageMeta: Record<string, ImageMeta>;
  updateAll: boolean;
}) {
  const limit = pLimit(3); // max 3 concurrent API requests

  const oldThreadMap = new Map<string, BlueskyPostThread>();
  for (const t of oldThreads) {
    const root = t.posts[0];
    if (root?.cid) oldThreadMap.set(root.cid, t);
  }

  await Promise.all(
    threads.map((thread) =>
      limit(async () => {
        const rootPost = thread.posts[0];
        if (!rootPost) return;

        const oldRootPost = oldThreadMap.get(rootPost.cid)?.posts[0];

        // Decide if we should fetch likes
        const needFullUpdate =
          updateAll || rootPost.likeCount !== oldRootPost?.likeCount;

        if (!needFullUpdate) return;

        let collectedLikes: typeof rootPost.likes = [];
        let remaining = MAXIMUM_NUMBER_OF_LIKE_AVATARS;
        let postIndex = 0;

        while (remaining > 0 && postIndex < thread.posts.length) {
          const currentPost = thread.posts[postIndex];
          if (!currentPost) break;

          const { data: likesData } = await agent.app.bsky.feed.getLikes({
            uri: currentPost.uri,
            limit: Math.min(remaining, 100), // API limit per call
          });

          collectedLikes.push(...likesData.likes);
          remaining = MAXIMUM_NUMBER_OF_LIKE_AVATARS - collectedLikes.length;
          postIndex++;
        }

        collectedLikes = dedupeLikes(collectedLikes);

        // Update root post
        rootPost.likes = collectedLikes.slice(
          0,
          MAXIMUM_NUMBER_OF_LIKE_AVATARS
        );

        // Download avatars
        await Promise.all(
          rootPost.likes.map(async (like) => {
            const did = like.actor.did.split(':').pop();
            if (like.actor.avatar && did) {
              const thumbnail = like.actor.avatar.replace(
                'avatar',
                'avatar_thumbnail'
              );
              await downloadImageIfChanged({
                url: thumbnail,
                localName: `avatar-thumbnail-${did}`,
                meta: imageMeta,
                publicAsset: true,
                updatedAt: like.actor.indexedAt,
              });
              const ext = getImageExtension(thumbnail);
              like.actor.avatar = `${SITE_URL}${PUBLIC_FOLDER.replace('./public', '')}/avatar-thumbnail-${did}${ext}`;
            }
          })
        );
      })
    )
  );
}

export function getHasLikesChanged(
  oldThreads: BlueskyPostThread[],
  newThreads: BlueskyPostThread[]
) {
  const oldThreadsMap = new Map(
    oldThreads?.map((thread) => [thread.rootUri, thread]) ?? []
  );

  for (const currentThread of newThreads) {
    const oldThread = oldThreadsMap.get(currentThread.rootUri);
    if (!oldThread) return true;

    const oldPostsMap = new Map(
      oldThread.posts.map((post) => [post.cid, post])
    );

    for (const currentPost of currentThread.posts) {
      const oldPost = oldPostsMap.get(currentPost.cid);
      if (!oldPost) return true;
      if (currentPost.likeCount !== oldPost.likeCount) return true;
    }
  }

  return false;
}
