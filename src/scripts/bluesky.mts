#!/usr/bin/env node

import 'dotenv/config';
import {
  BLUESKY_DATA_PATH,
  SITE_URL,
  downloadImageIfChanged,
  FILE_NAME,
  getAuthenticateBlueskyAgent,
  getLikes,
  getPostThreads,
  getProfile,
  loadImageMeta,
  PUBLIC_FOLDER,
  saveBlueskyData,
  saveImageMeta,
  type BlueskyData,
} from './utils.ts';
import { readFileSync, existsSync } from 'fs';

const HANDLE = process.env.BLUESKY_HANDLE;

async function main() {
  if (!HANDLE) {
    throw new Error('the BLUESKY_HANDLE environment variable must be set');
  }
  let oldBlueskyData: BlueskyData | undefined = undefined;

  if (existsSync(BLUESKY_DATA_PATH)) {
    oldBlueskyData = JSON.parse(readFileSync(BLUESKY_DATA_PATH, 'utf-8'));
  }
  const profileLatestTimestamp = oldBlueskyData?.profile.indexedAt;
  const postThreadsLatestTimestamp =
    oldBlueskyData?.threads?.[0]?.posts?.[0]?.indexedAt;
  const agent = await getAuthenticateBlueskyAgent();
  const profile = await getProfile(agent, HANDLE);
  const imageMeta = loadImageMeta();

  const avatarPath = profile.avatar
    ? await downloadImageIfChanged(
        profile.avatar.replace('avatar', 'avatar_thumbnail'),
        'profileAvatar',
        imageMeta,
        true
      )
    : undefined;

  const postThreads = await getPostThreads(agent, profile, imageMeta);

  const updateProfile =
    new Date(profile?.indexedAt ?? Date.now()) >
    new Date(profileLatestTimestamp ?? '1970-01-01T00:00:00Z');

  const updatePosts =
    new Date(postThreads?.[0]?.posts?.[0]?.indexedAt ?? Date.now()) >
    new Date(postThreadsLatestTimestamp ?? '1970-01-01T00:00:00Z');

  if (updateProfile || updatePosts) {
    //get likes if there are new threads or profile changes(used as fallback)
    await getLikes(agent, postThreads, imageMeta);

    const { avatar, ...rest } = profile;

    const data: BlueskyData = {
      profile: {
        ...rest,
        avatar: `${SITE_URL}${PUBLIC_FOLDER.replace('.', '')}/${avatarPath}`,
      },
      threads: postThreads,
    };

    saveBlueskyData(data);
    saveImageMeta(imageMeta);
    console.info(`✅ ${FILE_NAME} saved.`);
  } else {
    console.info(
      `✅ No changes detected on Bluesky – ${FILE_NAME} not updated.`
    );
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
// To run this script, set the environment variables BLUESKY_HANDLE and BLUESKY_APP_PASSWORD
// and execute it with Node.js:
// node --experimental-transform-types ./src/scripts/bluesky.mts
