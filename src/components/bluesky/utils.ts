import type {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyFeedDefs,
  AppBskyFeedGetLikes,
} from '@atproto/api';
import type { AppBskyRichtextFacet } from '@atproto/api';
import type { BlueskyPostThread } from '@customTypes/index';
import { SITE_URL, SERVERLESS_AUTH_TOKEN } from 'astro:env/client';
import { removeTrailingSlash, type Language } from '@i18n/utils';
import { capitalize } from '@utils/misc';

export const MAXIMUM_NUMBER_OF_LIKE_AVATARS = 55;

export type LikesResult = {
  uri: string;
  likes: AppBskyFeedGetLikes.Like[];
  likeCount: number;
}[];

interface RichTextFacet {
  features: (
    | AppBskyRichtextFacet.Mention
    | AppBskyRichtextFacet.Link
    | AppBskyRichtextFacet.Tag
  )[];
  index: AppBskyRichtextFacet.Main['index'];
}

type Embed =
  | AppBskyEmbedImages.View
  | AppBskyEmbedVideo.View
  | AppBskyEmbedExternal.View
  | AppBskyEmbedRecord.View
  | AppBskyEmbedRecordWithMedia.View;

export interface ProcessedTextSegment {
  type: 'text' | 'link' | 'hashtag';
  content: string;
  uri?: string;
  startIndex?: number;
  endIndex?: number;
  embed?: ProcessedEmbed;
}

export interface ProcessedEmbed {
  type: 'external' | 'image' | 'video';
  uri?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  alt?: string;
}

export interface ProcessedPost {
  id: string;
  content: {
    raw: string;
    segments: ProcessedTextSegment[];
  };
  embed?: ProcessedEmbed;
  engagement: {
    replies: number;
    reposts: number;
    likes: number;
    quotes: number;
  };
  likes?: AppBskyFeedGetLikes.Like[];
  createdAt: string;
  isMainPost: boolean;
  postNumber: number; // 1 for main post, 2, 3, etc. for replies
}

export interface ProcessedBlueskyThread {
  id: string;
  mainPost: ProcessedPost;
  replies: ProcessedPost[];
  totalPosts: number;
  viewOnBluesky: string;
  createdAt: string;
  recordKey: string;
}

/**
 * Processes rich text with facets (links, hashtags) into segments
 * Handles Unicode/emoji byte indexing correctly
 */
function processRichText(
  text: string,
  facets?: RichTextFacet[]
): ProcessedTextSegment[] {
  if (!facets || facets.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const segments: ProcessedTextSegment[] = [];
  const sortedFacets = [...facets].sort(
    (a, b) => a.index.byteStart - b.index.byteStart
  );

  const encoder = new TextEncoder();
  const graphemes = [
    ...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text),
  ];
  const byteOffsets: number[] = [];
  let byteIndex = 0;

  for (const g of graphemes) {
    const bytes = encoder.encode(g.segment);
    byteOffsets.push(byteIndex);
    byteIndex += bytes.length;
  }

  let currentCharIndex = 0;

  for (const facet of sortedFacets) {
    const { byteStart, byteEnd } = facet.index;

    // Find char indices corresponding to byte offsets
    const charStart = byteOffsets.findIndex((b) => b >= byteStart);
    const charEnd = byteOffsets.findIndex((b) => b >= byteEnd);
    const safeCharEnd = charEnd === -1 ? graphemes.length : charEnd;

    if (charStart === -1) continue;

    // Add text before this facet
    if (currentCharIndex < charStart) {
      const beforeText = graphemes
        .slice(currentCharIndex, charStart)
        .map((g) => g.segment)
        .join('');
      if (beforeText) {
        segments.push({ type: 'text', content: beforeText });
      }
    }

    // Add the facet content
    const facetText = graphemes
      .slice(charStart, safeCharEnd)
      .map((g) => g.segment)
      .join('');

    const feature = facet.features[0];
    if (feature?.$type === 'app.bsky.richtext.facet#link') {
      segments.push({
        type: 'link',
        content: facetText,
        uri: feature.uri,
        startIndex: charStart,
        endIndex: safeCharEnd,
      });
    } else if (feature?.$type === 'app.bsky.richtext.facet#tag') {
      segments.push({
        type: 'hashtag',
        content: facetText,
        startIndex: charStart,
        endIndex: safeCharEnd,
      });
    } else {
      segments.push({ type: 'text', content: facetText });
    }

    currentCharIndex = safeCharEnd;
  }

  // Add remaining text after last facet
  if (currentCharIndex < graphemes.length) {
    const remainingText = graphemes
      .slice(currentCharIndex)
      .map((g) => g.segment)
      .join('');
    if (remainingText) {
      segments.push({ type: 'text', content: remainingText });
    }
  }

  return segments;
}

/**
 * Processes embed data into a standardized format
 */
function processEmbed(embed?: Embed): ProcessedEmbed | undefined {
  if (!embed) return undefined;

  if (embed.$type === 'app.bsky.embed.external#view' && embed.external) {
    return {
      type: 'external',
      uri: embed.external.uri,
      title: embed.external.title,
      description: embed.external.description,
      thumbnail: embed.external.thumb,
    };
  }

  // Handle other embed types (images, videos) as needed
  if (embed.$type === 'app.bsky.embed.images#view' && embed.images) {
    return {
      type: 'image',
      thumbnail: embed.images[0]?.fullsize,
      alt: embed.images[0]?.alt,
    };
  }

  return undefined;
}

/**
 * Processes a single Bluesky post into a more usable format
 */
function processPost(
  post:
    | ({ likes?: AppBskyFeedGetLikes.Like[] } & AppBskyFeedDefs.PostView)
    | undefined,
  isMainPost: boolean,
  postNumber: number
): ProcessedPost {
  if (!post) {
    throw new Error('Post data not found when processing post');
  }
  return {
    id: post.uri,
    content: {
      raw:
        'text' in post.record && typeof post.record.text === 'string'
          ? post.record.text
          : '',
      segments: processRichText(
        'text' in post.record && typeof post.record.text === 'string'
          ? post.record.text
          : '',
        post.record.facets as RichTextFacet[]
      ),
    },
    embed: processEmbed(post.embed as Embed),
    engagement: {
      replies: post.replyCount || 0,
      reposts: post.repostCount || 0,
      likes: post.likeCount || 0,
      quotes: post.quoteCount || 0,
    },
    likes: post.likes,
    createdAt:
      'createdAt' in post.record && typeof post.record.createdAt === 'string'
        ? post.record.createdAt
        : post.indexedAt,
    isMainPost,
    postNumber,
  };
}

/**
 * Main function to construct processed threads from Bluesky API data
 */
export function constructBlueskyThreads(
  threads: BlueskyPostThread[]
): ProcessedBlueskyThread[] {
  return threads.map((thread) => {
    const posts = thread.posts;
    const mainPost = processPost(posts[0], true, 1);
    const replies = posts
      .slice(1)
      .map((post, index) => processPost(post, false, index + 2));

    return {
      id: thread.rootUri,
      mainPost,
      replies,
      totalPosts: posts.length,
      viewOnBluesky: thread.viewOnBluesky,
      createdAt: mainPost.createdAt,
      recordKey: thread.recordKey,
    };
  });
}

/**
 * Utility function to get a thread summary for display
 */
export function getThreadSummary(thread: ProcessedBlueskyThread): string {
  const mainText = thread.mainPost.content.raw;
  const maxLength = 150;

  if (mainText.length <= maxLength) {
    return mainText;
  }

  return mainText.slice(0, maxLength).trim() + '...';
}

/**
 * Utility function to extract hashtags from a thread
 */
export function extractHashtags(thread: ProcessedBlueskyThread): string[] {
  const hashtags = new Set<string>();

  // Extract from main post
  thread.mainPost.content.segments
    .filter((segment) => segment.type === 'hashtag')
    .forEach((segment) => hashtags.add(segment.content));

  // Extract from replies
  thread.replies.forEach((reply) => {
    reply.content.segments
      .filter((segment) => segment.type === 'hashtag')
      .forEach((segment) => hashtags.add(segment.content));
  });

  return Array.from(hashtags);
}

/**
 * Utility function to get all external links from a thread
 */
export function extractExternalLinks(
  thread: ProcessedBlueskyThread
): Array<{ url: string; title?: string; description?: string }> {
  const links: Array<{ url: string; title?: string; description?: string }> =
    [];

  if (thread.mainPost.embed?.type === 'external') {
    links.push({
      url: thread.mainPost.embed.uri!,
      title: thread.mainPost.embed.title,
      description: thread.mainPost.embed.description,
    });
  }

  thread.mainPost.content.segments
    .filter((segment) => segment.type === 'link')
    .forEach((segment) => {
      if (segment.uri) {
        links.push({ url: segment.uri });
      }
    });

  thread.replies.forEach((reply) => {
    if (reply.embed?.type === 'external') {
      links.push({
        url: reply.embed.uri!,
        title: reply.embed.title,
        description: reply.embed.description,
      });
    }

    reply.content.segments
      .filter((segment) => segment.type === 'link')
      .forEach((segment) => {
        if (segment.uri) {
          links.push({ url: segment.uri });
        }
      });
  });

  return links;
}

const GET_DEV_TIPS_LIKES_ENDPOINT =
  `${removeTrailingSlash(SITE_URL)}/.netlify/functions/get-dev-tips-likes` as const;

/** Timeout in ms */
const FETCH_TIMEOUT = 1000;

export async function getDevTipsLikes(atUris?: string[]): Promise<LikesResult> {
  try {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const res = await fetch(GET_DEV_TIPS_LIKES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVERLESS_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        atUris: atUris ?? [],
      }),
      signal: controller.signal,
    });

    const elapsed = performance.now() - startTime;

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Failed to fetch likes in ${elapsed}ms: ${res.status}`);
    }
    console.info(
      `✅Successfully fetched dev-tips likes from get-dev-tips-likes in ${elapsed}ms`
    );
    return res.json();
  } catch (error) {
    console.error('❌ Error fetching likes:', error);
    return [];
  }
}

export function linkifyDomains(
  text: string,
  classNames?: { link?: string; button?: string }
): string {
  return text.replace(
    /\b((https?:\/\/[^\s]+)|((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))(?![^<]*>|[^<>]*<\/)/g,
    (match) => {
      try {
        let domainMatch = match;

        if (!match.startsWith('http')) {
          domainMatch = `https://${match}`;
        }
        const { pathname, href, hostname } = new URL(domainMatch);
        const path = removeTrailingSlash(pathname);

        return `<a href="${href}" class="${classNames?.link || undefined}" target="_blank" rel="noopener noreferrer">${hostname}${path}</a>`;
      } catch {
        return match;
      }
    }
  );
}

export function createLikeProfileHTML(
  like: AppBskyFeedGetLikes.Like,
  lang: Language,
  styles: CSSModuleClasses
) {
  const avatarThumb = like.actor.avatar;
  const profileUrl = `https://bsky.app/profile/${like.actor.handle}`;
  const didId = like.actor.did.split(':').pop() || like.actor.did;
  const displayName = like.actor.displayName;
  const handle = like.actor.handle;
  const htmlDescription = linkifyDomains(like.actor.description || '', {
    link: styles.descriptionLink,
  });
  const buttonLabel = `${lang === 'da' ? 'Se profile info for' : 'View profile info for'} ${like.actor.displayName}`;
  const popoverWidth = 320;
  const closeButtonTitle = lang === 'da' ? 'Luk popover' : 'Close popover';

  return `
  <div
  class="${styles.popoverWrapper}"
  style="anchor-name: --${didId};"
  >
    <button
      class="${styles.likeProfileButton}"
      popovertarget="popover${capitalize(didId)}"
      id="popover${capitalize(didId)}Button"
      aria-label="${buttonLabel}"
      tabindex="0"
      data-arrow-nav="true"
      role="menuitem"
    > 
      <div class="${styles.likeButtonContent}"
        style="background-image: ${avatarThumb ? `url(${avatarThumb})` : 'none'}"
      />
    </button> 
    <div
    id="popover${capitalize(didId)}"
    class="${styles.popover}"
    data-position="top"
    data-width="${popoverWidth}"
    style="--width: ${popoverWidth}px;"
    popover
    >
      <button
        class="${styles.closeButton}"
        popovertarget="popover${capitalize(didId)}"
        title="${closeButtonTitle}"
        aria-label="${closeButtonTitle}"
      >
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        aria-hidden="true"
        >
          <path
            d="M11.0327 8L15.5814 3.45136C16.1395 2.89318 16.1395 1.98818 15.5814 1.42955L14.5705 0.418636C14.0123 -0.139545 13.1073 -0.139545 12.5486 0.418636L8 4.96727L3.45136 0.418636C2.89318 -0.139545 1.98818 -0.139545 1.42955 0.418636L0.418636 1.42955C-0.139545 1.98773 -0.139545 2.89273 0.418636 3.45136L4.96727 8L0.418636 12.5486C-0.139545 13.1068 -0.139545 14.0118 0.418636 14.5705L1.42955 15.5814C1.98773 16.1395 2.89318 16.1395 3.45136 15.5814L8 11.0327L12.5486 15.5814C13.1068 16.1395 14.0123 16.1395 14.5705 15.5814L15.5814 14.5705C16.1395 14.0123 16.1395 13.1073 15.5814 12.5486L11.0327 8Z"
            fill="currentColor"
            opacity="0.8" />
        </svg>
      </button>  
      <div class="${styles.popoverContent}">
        <div class="${styles.popoverTop}">
          <div class="${styles.avatar}"
            style="background-image: ${
              avatarThumb
                ? `url(${avatarThumb})`
                : 'linear-gradient(var(--system-dark-300-55), var(--system-dark-300-80))'
            };">
          </div>
          <a class="${styles.viewProfileOnBluesky}"
            href="${profileUrl}"
            target="_blank"
            rel="noopener noreferrer">
            <p>${lang === 'da' ? 'Vis profil på Bluesky' : 'View Profile on Bluesky'}</p>
            <svg aria-hidden="true" width="16" height="18" viewBox="0 0 122 107">
              <path d="M60.9002 50.0081C66.209 38.6319 81.3772 17.3965 95.4078 7.15799C105.267 -0.42609 121.573 -6.11415 121.573 12.4669C121.573 16.2589 119.298 43.5616 118.16 48.112C113.989 63.6594 98.0622 67.4515 84.0316 65.1762C108.68 69.3475 114.747 83.378 101.475 97.0294C75.6891 123.194 64.6922 90.5829 61.6586 81.8612L61.5448 81.5199C61.2036 80.3823 61.1656 80.0031 60.7864 80.0031C60.4072 80.0031 60.4451 80.7615 60.028 81.5199L59.9142 81.8612C56.8806 90.2037 45.8837 123.194 20.0978 97.0294C6.44647 83.378 12.8929 69.3475 37.5412 65.1762C23.5107 67.4515 7.58408 63.6594 3.41284 48.112C2.27523 43.5616 0 16.2589 0 12.4669C0 -6.11415 16.3058 -0.42609 26.1651 7.15799C40.1956 17.7757 54.9846 38.6319 60.6727 50.0081H60.9002Z" fill="currentColor" opacity="0.8"></path>
            </svg>
          </a>
        </div>
        ${displayName ? `<h3 class="${styles.displayName}">${displayName}</h3>` : ''}
        <p class="small-body-text ${styles.handle}">@${handle}</p>
        ${
          htmlDescription &&
          `<span class="small-body-text ${styles.description}">${htmlDescription}</span>`
        }
      </div>
    </div>
  </div>
  `;
}
