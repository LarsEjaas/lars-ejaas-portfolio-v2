import { AtpAgent } from '@atproto/api';
import dotenv from 'dotenv';
import { type Context } from '@netlify/functions';

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

type PublicBlueskyData = {
  threads: {
    atUri: string;
  }[];
};

export default async (req: Request, context: Context) => {
  // Enable CORS for local development
  const devHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  const site_url = removeTrailingSlash(context.url.origin);
  if (
    process.env.NODE_ENV !== 'development' &&
    req.headers.get('origin') !== site_url
  ) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers:
        process.env.NODE_ENV === 'development'
          ? devHeaders
          : { 'content-type': 'application/json' },
    });
  }
  try {
    //Load environment variables during development
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }
    const siteUrl = removeTrailingSlash(process.env.SITE_URL || '');
    const publicFilePath = `${siteUrl}/bluesky.json`;
    console.log();
    const res = await fetch(publicFilePath);
    if (!res.ok) {
      throw new Error('Failed to fetch bluesky.json');
    }
    const blueskyData: PublicBlueskyData = await res.json();

    const agent = await getAuthenticateBlueskyAgent();

    const likesResults = await Promise.all(
      blueskyData.threads.map(async (thread) => {
        const { data: likesData } = await agent.app.bsky.feed.getLikes({
          uri: thread.atUri,
          limit: 100,
        });
        return { uri: thread.atUri, likes: likesData.likes };
      })
    );

    return new Response(JSON.stringify(likesResults), {
      status: 200,
      headers: {
        ...(process.env.NODE_ENV === 'development' ? devHeaders : {}),
      },
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};
