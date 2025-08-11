import { AtpAgent } from '@atproto/api';
import type {
  AppBskyFeedSearchPosts,
  AppBskyActorDefs,
  AppBskyFeedDefs,
  AppBskyEmbedImages,
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
import type { BlueskyPostThread } from '@customTypes/index';

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

  const searchResults = await searchPosts(agent, {
    q: `#${SEARCH_TAG}`,
    author: HANDLE,
    limit: 100,
    sort: 'latest',
    tag: [SEARCH_TAG],
  });

  for (const post of searchResults.posts) {
    const { data } = await agent.app.bsky.feed.getPostThread({
      uri: post.uri,
      depth: 10,
      parentHeight: 0,
    });

    if ('post' in data.thread && data.thread.post.author.did === profile.did) {
      const filtered = await getOwnThreadOnly(data.thread, profile.did);

      // Download any images from these posts
      for (const post of filtered) {
        if (post.embed && 'images' in post.embed) {
          for (const image of post.embed
            .images as (AppBskyEmbedImages.ViewImage & {
            localPath?: string;
          })[]) {
            await downloadImageIfChanged({
              url: image.fullsize,
              localName: `post-${post.uri.split('/').pop()}`,
              meta: imageMeta,
              publicAsset: true,
            });
            image.localPath = `${PUBLIC_FOLDER.replace('./public', '')}post-${post.uri.split('/').pop()}`;
          }
        }
        if (
          post.embed &&
          'external' in post.embed &&
          'thumb' in post.embed.external &&
          typeof post.embed.external.thumb === 'string'
        ) {
          await downloadImageIfChanged({
            url: post.embed.external.thumb,
            localName: `post-${post.uri.split('/').pop()}-embed`,
            meta: imageMeta,
          });
        }
      }
      const recordKey = data.thread.post.uri.split('/').pop() || '';
      threads.push({
        rootUri: data.thread.post.uri,
        posts: filtered,
        viewOnBluesky: `https://bsky.app/profile/${profile.handle}/post/${recordKey}`,
        // add prefix to recordKey to be able to use it as a HTML element ID (recordKey cannot start with a number)
        recordKey: `bsky${recordKey}`,
      });
    }
  }

  return threads;
}

export async function getLikes(
  agent: AtpAgent,
  threads: BlueskyPostThread[],
  imageMeta: Record<string, ImageMeta>
) {
  await Promise.all(
    threads.map(async (thread) => {
      const [{ data: likesData }, { data: postData }] = await Promise.all([
        agent.app.bsky.feed.getLikes({ uri: thread.rootUri, limit: 100 }),
        agent.app.bsky.feed.getPosts({ uris: [thread.rootUri] }),
      ]);
      console.info('✅ likes returned from Bluesky API:');
      if (
        thread.posts[0] &&
        postData.posts.length > 0 &&
        postData.posts[0]?.likeCount
      ) {
        thread.posts[0].likes = likesData.likes;
        thread.posts[0].likeCount = postData.posts[0].likeCount;

        for (const like of thread.posts[0].likes) {
          const did = like.actor.did.split(':').pop();
          if (like.actor.avatar && did) {
            const thumnail = like.actor.avatar.replace(
              'avatar',
              'avatar_thumbnail'
            );
            await downloadImageIfChanged({
              url: thumnail,
              localName: `avatar-thumbnail-${did}`,
              meta: imageMeta,
              publicAsset: true,
              updatedAt: like.actor.indexedAt,
            });
            const ext = getImageExtension(thumnail);
            like.actor.avatar = `${SITE_URL}${PUBLIC_FOLDER.replace('./public', '')}/avatar-thumbnail-${did}${ext}`;
          }
        }
      }
    })
  );
}
