#!/usr/bin/env node

import 'dotenv/config';
import {
  downloadImageIfChanged,
  getAuthenticateBlueskyAgent,
  getPostThreads,
  getProfile,
  loadImageMeta,
  saveBlueskyData,
  saveImageMeta,
  type BlueskyData,
} from './utils.ts';

const HANDLE = process.env.BLUESKY_HANDLE;

async function main() {
  if (!HANDLE) {
    throw new Error('the BLUESKY_HANDLE environment variable must be set');
  }
  const agent = await getAuthenticateBlueskyAgent();
  const profile = await getProfile(agent, HANDLE);
  const imageMeta = loadImageMeta();

  const avatarPath = profile.avatar
    ? await downloadImageIfChanged(profile.avatar, 'profileAvatar', imageMeta)
    : null;

  const postThreads = await getPostThreads(agent, profile, imageMeta);

  const data: BlueskyData = {
    profile: {
      handle: profile.handle,
      displayName: profile.displayName,
      avatar: avatarPath,
    },
    threads: postThreads,
  };

  saveBlueskyData(data);
  saveImageMeta(imageMeta);
  console.info('✅ bluesky_data.json saved.');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
// To run this script, set the environment variables BLUESKY_HANDLE and BLUESKY_APP_PASSWORD
// and execute it with Node.js:
// node --experimental-transform-types --env-file=.env ./src/scripts/bluesky.mts
