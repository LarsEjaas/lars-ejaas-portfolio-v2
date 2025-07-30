import { getStore } from '@netlify/blobs';
import dotenv from 'dotenv';
import type { AppBskyFeedGetLikes } from '@atproto/api';

type LikesResult = {
  uri: string;
  likes: AppBskyFeedGetLikes.Like[];
  likeCount: number;
}[];

// Enable CORS for local development
const DEV_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const AUTH_HEADER = 'authorization';

/**
 * Serverless function that returns likes for Bluesky threads.
 *
 * Optionally accepts a JSON body containing an `atUris` array of thread URIs.
 * If `atUris` is provided, the function returns likes only for those specific threads.
 * If omitted, it returns likes for all available threads.
 */
export default async (req: Request) => {
  //Load environment variables during development
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }
  const expectedToken = process.env.SERVERLESS_AUTH_TOKEN;

  if (process.env.NODE_ENV !== 'development') {
    const authHeader = req.headers.get(AUTH_HEADER);
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const requestedUris: string[] | undefined = Array.isArray(body.atUris)
      ? body.atUris
      : undefined;

    const likesStore = getStore('bluesky-likes');

    const likesBlob = await likesStore.get('dev-tips');

    let likesResult: LikesResult = [];

    try {
      likesResult = likesBlob ? JSON.parse(likesBlob) : [];
    } catch {
      console.warn('⚠️ Failed to parse likes blob — using empty array');
    }

    if (likesBlob === null && likesResult?.length) {
      console.info('✅Successfully retrieved dev-tips likes from blob');
    }

    if (requestedUris?.length) {
      likesResult = likesResult.filter((threadLikes) =>
        requestedUris.includes(threadLikes.uri)
      );
    }

    return new Response(JSON.stringify(likesResult, null, 2), {
      status: 200,
      headers: {
        ...(process.env.NODE_ENV === 'development' ? DEV_HEADERS : {}),
      },
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...(process.env.NODE_ENV === 'development' ? DEV_HEADERS : {}),
        },
      }
    );
  }
};
