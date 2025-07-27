import { AppBskyFeedGetLikes, AtpAgent } from '@atproto/api';
import dotenv from 'dotenv';
import { type Config, purgeCache } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const PUBLIC_FILENAME = 'devtips-threads.json';

type PublicBlueskyData = {
  threads: {
    atUri: string;
  }[];
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

  console.info(
    'Running update-dev-tips-likes in development! Next invocation at:',
    next_run
  );

  try {
    //Load environment variables during development
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }
    const siteUrl = removeTrailingSlash(process.env.SITE_URL || '');
    const publicFilePath = `${siteUrl}/${PUBLIC_FILENAME}`;
    console.log();
    const res = await fetch(publicFilePath);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${PUBLIC_FILENAME}`);
    }
    const blueskyData: PublicBlueskyData = await res.json();

    const agent = await getAuthenticateBlueskyAgent();

    const likesResults: LikesResult = await Promise.all(
      blueskyData.threads.map(async (thread) => {
        const { data: likesData } = await agent.app.bsky.feed.getLikes({
          uri: thread.atUri,
          limit: 100,
        });
        return {
          uri: thread.atUri,
          likes: likesData.likes,
          likeCount: likesData.likes.length,
        };
      })
    );

    // 🔁 Get existing likes from the blob store
    const likesStore = getStore('bluesky-likes');
    const existingDataRaw = await likesStore.get('dev-tips');
    const existingData: LikesResult = existingDataRaw
      ? JSON.parse(existingDataRaw)
      : [];

    // 🔍 Check if likes count has changed
    let shouldUpdate = false;

    for (const current of likesResults) {
      const previous = existingData.find((entry) => entry.uri === current.uri);
      const prevCount = previous?.likes?.length ?? 0;
      if (current.likeCount !== prevCount) {
        shouldUpdate = true;
        break;
      }
    }

    if (shouldUpdate) {
      await likesStore.setJSON('dev-tips', likesResults);
      console.info('✅ dev-tips entry stored in blob (likes count changed)');
      // Invalidate the cache tag for the home page
      await purgeCache({ tags: ['home'] });
      console.info('♻️  Cache for home page invalidated via cache tag: "home"');
    } else {
      console.info('⏩ No changes in likes count – skipping blob update');
    }
  } catch (error) {
    console.error(error);
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
