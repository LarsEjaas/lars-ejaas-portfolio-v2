#!/usr/bin/env node

import {
  AppBskyFeedSearchPosts,
  AtpAgent,
  AppBskyActorDefs,
  AppBskyFeedDefs,
} from '@atproto/api';
import { mkdirSync, createWriteStream } from 'fs';
// import { writeFileSync, mkdirSync, createWriteStream } from 'fs';
import { extname } from 'path';
// import { basename, extname } from 'path';
import { pipeline } from 'stream/promises';
// import { fileURLToPath } from 'url';
import 'dotenv/config';

const HANDLE = process.env.BLUESKY_HANDLE;

async function downloadImage(url: string, localName: string): Promise<string> {
  const ext = extname(new URL(url).pathname);
  const localPath = `./assets/bluesky/${localName}${ext}`;
  mkdirSync('./assets/bluesky', { recursive: true });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.statusText}`);
  }

  const fileStream = createWriteStream(localPath);
  await pipeline(res.body as any, fileStream);

  return `assets/${localName}${ext}`;
}

async function getAuthenticateBlueskyAgent(): Promise<AtpAgent> {
  const appPassword = process.env.BLUESKY_APP_PASSWORD;
  if (!HANDLE || !appPassword) {
    throw new Error(
      'BLUESKY_HANDLE and BLUESKY_APP_PASSWORD environment variables must be set'
    );
  }
  const agent = new AtpAgent({ service: 'https://bsky.social' });

  try {
    await agent.login({
      identifier: HANDLE,
      password: appPassword,
    });

    return agent;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Bluesky login failed: ${err.message}`);
    }
    throw new Error('Unknown error during Bluesky login');
  }
}

async function getProfile(
  agent: AtpAgent,
  actor: string
): Promise<AppBskyActorDefs.ProfileViewDetailed> {
  try {
    const response = await agent.getProfile({
      actor,
    });

    return response.data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Profile fetch failed:: ${err.message}`);
    }
    throw new Error('Unknown error during Bluesky profile fetch');
  }
}

// Search for posts using structured parameters
async function searchPosts(
  agent: AtpAgent,
  options: AppBskyFeedSearchPosts.QueryParams
): Promise<AppBskyFeedSearchPosts.OutputSchema> {
  try {
    const response = await agent.app.bsky.feed.searchPosts(options);

    return response.data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Bluesky login failed: ${err.message}`);
    }
    throw new Error('Unknown error during Bluesky login');
  }
}

async function getPostThreads(
  agent: AtpAgent
): Promise<AppBskyFeedDefs.ThreadViewPost[]> {
  const threads: AppBskyFeedDefs.ThreadViewPost[] = [];

  try {
    // Check if environment variables are set
    if (!process.env.BLUESKY_HANDLE || !process.env.BLUESKY_APP_PASSWORD) {
      throw new Error(
        'Please set BLUESKY_HANDLE and BLUESKY_APP_PASSWORD environment variables'
      );
    }

    const searchResults = await searchPosts(agent, {
      q: '#DeveloperTips',
      author: HANDLE,
      limit: 100,
      sort: 'latest',
      tag: ['DeveloperTips'],
    });

    console.log('searchResults:', searchResults);

    if (searchResults.posts.length > 0) {
      for (const post of searchResults.posts) {
        const { data } = await agent.app.bsky.feed.getPostThread({
          uri: post.uri,
        });
        if ('post' in data.thread) {
          console.log(`data.thread: ${JSON.stringify(data.thread, null, 2)}`);
          threads.push(data.thread);
        }
      }
      console.log(`📊 Found ${searchResults.hitsTotal} total posts`);
      console.log('📋 Posts for your webpage:');
      console.log(JSON.stringify(searchResults, null, 2));
      searchResults.posts.forEach((post) => {
        console.log(`post.record: - ${JSON.stringify(post.record, null, 2)}`);
      });

      console.log(`📋 Threads: ${threads}`);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    return threads;
  }
}

async function downloadEmbedImages(
  threadViewPosts: AppBskyFeedDefs.ThreadViewPost[]
): Promise<void> {
  for (const threadViewPost of threadViewPosts) {
    if (threadViewPost.post.embed && 'images' in threadViewPost.post.embed) {
      for (const image of threadViewPost.post.embed.images) {
        if (image.fullsize) {
          const localPath = await downloadImage(
            image.fullsize,
            `post-${threadViewPost.post.uri.split('/').pop()}`
          );
          console.log(`Downloaded image to ${localPath}`);
        }
      }
    }
    if (threadViewPost.replies && 'posts' in threadViewPost.replies) {
      for (const reply of threadViewPost.replies) {
        if (
          'post' in reply &&
          reply.post.embed &&
          'images' in reply.post.embed
        ) {
          for (const image of reply.post.embed.images) {
            if (image.fullsize) {
              const localPath = await downloadImage(
                image.fullsize,
                `post-${reply.post.uri.split('/').pop()}`
              );
              console.log(`Downloaded image to ${localPath}`);
            }
          }
        }
      }
    }
  }
}

async function main() {
  if (!HANDLE) {
    throw new Error('the BLUESKY_HANDLE environment variable must be set');
  }
  const agent = await getAuthenticateBlueskyAgent();
  const profile = await getProfile(agent, HANDLE);

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
  const postThreads = await getPostThreads(agent);
  downloadEmbedImages(postThreads);
}

main();
// To run this script, set the environment variables BLUESKY_HANDLE and BLUESKY_APP_PASSWORD
// and execute it with Node.js:
// node --experimental-transform-types --env-file=.env ./src/scripts/bluesky.mts
