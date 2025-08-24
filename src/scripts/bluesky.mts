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
  getPublicAssetUrl,
  saveBlueskyData,
  saveImageMeta,
  type BlueskyData,
  getHasLikesChanged,
} from './utils.ts';
import { readFileSync, existsSync } from 'fs';
const SCRIPT_ARGS = process.argv.slice(2);

const HANDLE = process.env.BLUESKY_HANDLE;

async function main() {
  const updateAll = SCRIPT_ARGS.includes('--updateAll');

  if (updateAll) {
    console.info(`⚠️  updating all bluesky data!`);
  }
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
    ? await downloadImageIfChanged({
        url: profile.avatar.replace('avatar/plain', 'avatar_thumbnail/plain'),
        localName: 'profileAvatar',
        meta: imageMeta,
        publicAsset: true,
      })
    : undefined;

  const postThreads = await getPostThreads(agent, profile, imageMeta);

  const profileUpdated =
    new Date(profile?.indexedAt ?? Date.now()) >
    new Date(profileLatestTimestamp ?? '1970-01-01T00:00:00Z');

  //Only check the latest thread
  const postsUpdated =
    new Date(postThreads?.[0]?.posts?.[0]?.indexedAt ?? Date.now()) >
    new Date(postThreadsLatestTimestamp ?? '1970-01-01T00:00:00Z');

  const newThreadsOrLikesChanged = getHasLikesChanged(
    oldBlueskyData?.threads || [],
    postThreads
  );

  if (newThreadsOrLikesChanged) {
    console.info(`❤️ Change in one or more likes detected!`);
  }

  const newSiteHost = SITE_URL !== oldBlueskyData?.host;

  if (newThreadsOrLikesChanged || updateAll) {
    await getLikes({
      agent,
      threads: postThreads,
      oldThreads: oldBlueskyData?.threads || [],
      imageMeta,
      updateAll,
    });
  }

  if (
    updateAll ||
    profileUpdated ||
    postsUpdated ||
    newSiteHost ||
    newThreadsOrLikesChanged
  ) {
    const { avatar, ...rest } = profile;

    const data: BlueskyData = {
      profile: {
        ...rest,
        avatar: avatarPath ? getPublicAssetUrl(avatarPath) : undefined,
      },
      threads: postThreads,
      host: SITE_URL,
    };

    saveBlueskyData({ data, imageMeta });
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
//
// To force a full update of all data run the script with the `--updateAll` flag
