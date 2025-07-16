#!/usr/bin/env node

import 'dotenv/config';

interface SearchResponse {
  cursor?: string;
  hitsTotal?: number;
  posts: PostView[];
}

interface Label {
  value: string;
  createdAt: string;
  creatorDid: string;
  creatorHandle: string;
}

interface Viewer {
  muted: boolean;
  blockedBy: boolean;
  following?: string;
  followedBy?: string;
}

interface PostView {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    createdAt: string;
    facets: {
      features: [
        {
          $type: string;
          uri: string;
        },
      ];
      index: {
        byteEnd: number;
        byteStart: number;
      };
    }[];
    langs: string[];
    text: string;
  };
  replyCount: number;
  repostCount: number;
  likeCount: number;
  quoteCount: number;
  indexedAt: string;
  viewer: Viewer;
  labels: Label[];
}

interface CreateSessionResponse {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
  email?: string;
  emailConfirmed?: boolean;
}

interface ProfileResponse {
  did: string;
  handle: string;
  displayName?: string;
  associated: {
    lists: number;
    feedgens: number;
    starterPacks: number;
    labeler: boolean;
    chat: { allowIncoming: string };
    activitySubscription: { allowSubscriptions: string };
  };
  viewer: Viewer;
  labels: Label[];
  createdAt: string;
  description?: string;
  indexedAt: string;
  banner?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  pinnedPost?: {
    cid: string;
    uri: string;
  };
  avatar?: string;
}

async function authenticateBluesky(): Promise<string> {
  const response = await fetch(
    'https://bsky.social/xrpc/com.atproto.server.createSession',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: process.env.BLUESKY_HANDLE,
        password: process.env.BLUESKY_APP_PASSWORD,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Authentication failed: ${error.error} - ${error.message}`);
  }

  const data: CreateSessionResponse = await response.json();
  return data.accessJwt;
}

async function getProfile(
  accessToken: string,
  actor: string
): Promise<ProfileResponse> {
  const response = await fetch(
    `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${actor}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Profile fetch failed: ${error.error} - ${error.message}`);
  }

  return await response.json();
}

// Search for posts using structured parameters
async function searchPosts(
  accessToken: string,
  options: {
    query: string;
    author?: string;
    tags?: string[];
    since?: string;
    until?: string;
    sort?: 'top' | 'latest';
    limit?: number;
  }
): Promise<SearchResponse> {
  const url = new URL('https://bsky.social/xrpc/app.bsky.feed.searchPosts');

  // Add query parameter
  url.searchParams.set('q', options.query);

  // Add author parameter
  if (options.author) {
    url.searchParams.set('author', options.author);
  }

  // Add tags - multiple tags are added as separate parameters
  if (options.tags && options.tags.length > 0) {
    options.tags.forEach((tag) => {
      url.searchParams.append('tag', tag);
    });
  }

  // Add other optional parameters
  if (options.since) {
    url.searchParams.set('since', options.since);
  }

  if (options.until) {
    url.searchParams.set('until', options.until);
  }

  if (options.sort) {
    url.searchParams.set('sort', options.sort);
  }

  // Set limit (default to 25)
  url.searchParams.set('limit', (options.limit || 25).toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Search failed: ${error.error} - ${error.message}`);
  }

  return await response.json();
}

async function main(): Promise<void> {
  try {
    // Check if environment variables are set
    if (!process.env.BLUESKY_HANDLE || !process.env.BLUESKY_APP_PASSWORD) {
      throw new Error(
        'Please set BLUESKY_HANDLE and BLUESKY_APP_PASSWORD environment variables'
      );
    }

    console.log('🔐 Authenticating with Bluesky...');
    const accessToken = await authenticateBluesky();
    console.log('✅ Authentication successful!');

    console.log('👤 Fetching profile for larsejaas.bsky.social...');
    const profile = await getProfile(accessToken, 'larsejaas.bsky.social');

    console.log('📋 Profile Information:');
    console.log(`Handle: ${profile.handle}`);
    console.log(`Display Name: ${profile.displayName || 'Not set'}`);
    console.log(`Description: ${profile.description || 'No description'}`);
    console.log(`Followers: ${profile.followersCount}`);
    console.log(`Following: ${profile.followsCount}`);
    console.log(`Posts: ${profile.postsCount}`);
    console.log(`DID: ${profile.did}`);
    console.log(`full Profile:`, profile);

    if (profile.avatar) {
      console.log(`Avatar: ${profile.avatar}`);
    }

    const searchResults = await searchPosts(accessToken, {
      query: '#DeveloperTips',
      author: 'larsejaas.bsky.social',
      limit: 100,
      sort: 'latest',
      tags: ['DeveloperTips'],
    });

    console.log('searchResults:', searchResults);

    if (searchResults.posts.length > 0) {
      console.log(`📊 Found ${searchResults.hitsTotal} total posts`);
      console.log('📋 Posts for your webpage:');
      console.log(JSON.stringify(searchResults, null, 2));
      searchResults.posts.forEach((post) => {
        console.log(`post.record: - ${JSON.stringify(post.record, null, 2)}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
// To run this script, set the environment variables BLUESKY_HANDLE and BLUESKY_APP_PASSWORD
// and execute it with Node.js:
// node --experimental-transform-types --env-file=.env ./src/scripts/bluesky.mts
