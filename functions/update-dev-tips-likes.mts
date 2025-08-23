import { AppBskyFeedGetLikes, AtpAgent } from '@atproto/api';
import dotenv from 'dotenv';
import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import pLimit from 'p-limit';

const limit = pLimit(3); // Max 3 concurrent API requests to Bluesky

const PUBLIC_FILENAME = 'devtips-threads.json';

const BLOB_KEY = 'dev-tips';

type PublicBlueskyData = {
  threads: {
    atUri: string;
  }[];
  images: Record<
    string,
    {
      updatedAt: string;
      localPath: string;
    }
  >;
};

type LikesResult = {
  uri: string;
  likes: AppBskyFeedGetLikes.Like[];
  likeCount: number;
}[];

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

/**
 * Retries an asynchronous function on failure using exponential backoff.
 *
 * @throws Will throw the last encountered error if all retries are exhausted.
 *
 * @example const res = await withRetry(() => fetch(publicFilePath));
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

const isValidDate = (date: Date | null): date is Date =>
  date instanceof Date && !isNaN(date.getTime());

export async function getAuthenticateBlueskyAgent(): Promise<AtpAgent> {
  const appPassword = process.env.BLUESKY_APP_PASSWORD;
  const handle = process.env.BLUESKY_HANDLE;
  if (!handle || !appPassword) {
    throw new Error(
      'BLUESKY_HANDLE and BLUESKY_APP_PASSWORD environment variables must be set'
    );
  }
  const agent = new AtpAgent({ service: 'https://bsky.social' });

  await agent.login({
    identifier: handle,
    password: appPassword,
  });

  return agent;
}

export default async (req: Request) => {
  const { next_run } = await req.json();

  console.log(
    '[INFO]',
    'ℹ️ Running update-dev-tips-likes in development! Next invocation at:',
    next_run
  );

  try {
    //Load environment variables during development
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }
    const siteUrl = removeTrailingSlash(process.env.SITE_URL || '');
    const publicFilePath = `${siteUrl}/${PUBLIC_FILENAME}`;
    const res = await fetch(publicFilePath);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${PUBLIC_FILENAME}`);
    }
    const publicBlueskyData: PublicBlueskyData = await res.json();

    const agent = await getAuthenticateBlueskyAgent();

    const likesResults: LikesResult = await Promise.all(
      publicBlueskyData.threads.map((thread) =>
        limit(async () => {
          const [{ data: likesData }, { data: postData }] = await Promise.all([
            withRetry(() =>
              agent.app.bsky.feed.getLikes({ uri: thread.atUri, limit: 100 })
            ),
            withRetry(() =>
              agent.app.bsky.feed.getPosts({ uris: [thread.atUri] })
            ),
          ]);

          if (postData.posts[0]?.likeCount) {
            console.log('[WARN]', `⚠️ No likeCount found for ${thread.atUri}`);
          }
          return {
            uri: thread.atUri,
            likes: likesData.likes,
            likeCount: postData.posts[0]?.likeCount || 0,
          };
        })
      )
    );

    // 🔁 Get existing likes from the blob store
    const likesStore = getStore('bluesky-likes');
    const existingDataRaw = await likesStore.get(BLOB_KEY);
    const existingData: LikesResult = existingDataRaw
      ? JSON.parse(existingDataRaw)
      : [];

    let shouldUpdate = false;

    const previousMap = new Map(
      existingData.map((entry) => [entry.uri, entry])
    );

    for (const current of likesResults) {
      // Compare with previous likes
      const previous = previousMap.get(current.uri);

      // Build a map of previous likes for quick access
      const previousLikesMap = new Map<string, string>();

      if (previous?.likes) {
        for (const prevLike of previous.likes) {
          previousLikesMap.set(prevLike.actor.did, prevLike.actor.avatar ?? '');
        }
      }

      // Use the local avatar image if its available and not outdated
      current.likes.forEach((like) => {
        const avatar = like.actor.avatar?.replace(
          'avatar/plain',
          'avatar_thumbnail/plain'
        );
        // Check if we have a local copy of the avatar
        if (
          like.indexedAt &&
          avatar &&
          Object.keys(publicBlueskyData.images).includes(avatar)
        ) {
          const localUpdatedAtStr = publicBlueskyData.images[avatar]?.updatedAt;
          const actorIndexedAtStr = like.actor.indexedAt;

          const localImageTimestamp = localUpdatedAtStr
            ? new Date(localUpdatedAtStr)
            : null;

          const blueskyImageTimestamp = actorIndexedAtStr
            ? new Date(actorIndexedAtStr)
            : null;

          const useLocalImage =
            isValidDate(localImageTimestamp) &&
            isValidDate(blueskyImageTimestamp) &&
            localImageTimestamp >= blueskyImageTimestamp;

          if (useLocalImage && publicBlueskyData.images?.[avatar]?.localPath) {
            like.actor.avatar = `${siteUrl}${publicBlueskyData.images[avatar].localPath}`;
            // Check if the avatar has changed
            const previousAvatar = previousLikesMap.get(like.actor.did);
            if (like.actor.avatar !== previousAvatar) {
              shouldUpdate = true;
              console.log(
                '[INFO]',
                `🖼️ Using the local image for ${like.actor.displayName || like.actor.handle}`
              );
            }
          }
        }
      });

      // 🔍 Check if likes count has changed

      const prevCount = previous?.likes?.length ?? 0;
      // Compare current like count with previous
      // If the count has changed, we need to update the blob
      if (current.likeCount !== prevCount) {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      await likesStore.setJSON(BLOB_KEY, likesResults);
      console.log(
        '[INFO]',
        `✅ ${BLOB_KEY} entry stored in blob (likes count changed)`
      );
    } else {
      console.log(
        '[INFO]',
        '⏩ No changes in likes count – skipping blob update'
      );
    }
  } catch (error) {
    console.log('[ERROR]', '❗Error updating Developer Tips likes:', error);
  }
};

// This function can be invoked locally for testing:
// curl http://localhost:5432/.netlify/functions/update-dev-tips-likes

export const config: Config = {
  schedule: '*/15 * * * *', // every 15 minutes,
};

//cron
// ┌───────────── minute (0 - 59)
// │ ┌───────────── hour (0 - 23)
// │ │ ┌───────────── day of the month (1 - 31)
// │ │ │ ┌───────────── month (1 - 12)
// │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
// │ │ │ │ │
// │ │ │ │ │
// * * * * *
//
