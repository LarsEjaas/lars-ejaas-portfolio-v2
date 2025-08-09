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
import { notEmpty, type BlueskyPostThread } from '@customTypes/index';
import { SITE_URL, SERVERLESS_AUTH_TOKEN } from 'astro:env/client';
import { removeTrailingSlash, type Language } from '@i18n/utils';
import { capitalize } from '@utils/misc';
import styles from './blueskyLikes.module.css';
import popoverStyles from '@components/popover/popover.module.css';

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

export type ProcessedEmbed =
  | {
      type: 'external' | 'video';
      uri?: string;
      title?: string;
      description?: string;
      thumbnail?: string;
      alt?: string;
    }
  | {
      type: 'images';
      images: {
        id: string;
        uri: string;
        alt?: string;
        aspectRatio?: { height: number; width: number };
      }[];
    };

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

function extractDidPlcId(input: string) {
  let s = input;
  try {
    s = decodeURIComponent(input);
  } catch (error) {
    throw new Error(
      `Failed to decode input at extractDidPlcId:${input} ${error}`
    );
  }
  const m = s.match(/did:plc:([^/]+)/);
  return m ? m[1] : null;
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
      type: 'images',
      images: embed.images
        .map((image) => {
          const extractedId = extractDidPlcId(image.fullsize);
          if (!extractedId) {
            return undefined;
          }
          return {
            id: extractedId,
            uri: image.fullsize,
            alt: image.alt,
            aspectRatio: image.aspectRatio
              ? {
                  height: image.aspectRatio?.height,
                  width: image.aspectRatio.width,
                }
              : undefined,
          };
        })
        .filter(notEmpty),
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

/**
 * Converts plain domain names and URLs in a text string into clickable anchor (`<a>`) tags.
 *
 * - Detects full URLs (e.g., `https://example.com/path`) and bare domains (e.g., `example.com`).
 * - Automatically adds `https://` to domains that don't include a scheme.
 * - Strips trailing slashes from the URL path.
 * - Adds `target="_blank"` and `rel="noopener noreferrer"` for security.
 */
export function linkifyDomains(
  text: string,
  classNames?: { link?: string }
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

/** Helper method to make long template litteral strings easier to read */
function html(strings: TemplateStringsArray, ...values: unknown[]) {
  return String.raw({ raw: strings }, ...values)
    .replace(/^\s*\n/, '') // Remove leading newline
    .replace(/\n\s+$/, '') // Remove trailing newline
    .trim();
}

/**
 * Generates the full HTML string for a like profile with popover
 */
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

  const buttonLabel = `${lang === 'da' ? 'Se profile info for' : 'View profile info for'} ${like.actor.displayName}`;
  const popoverWidth = 320;
  const closeButtonTitle = lang === 'da' ? 'Luk popover' : 'Close popover';

  function renderPopoverButton({
    id,
    styles,
    avatarThumb,
    buttonLabel,
  }: {
    id: string;
    styles: CSSModuleClasses;
    avatarThumb: string | undefined;
    buttonLabel: string;
  }) {
    return `
      <button
        class="${styles.likeProfileButton}"
        popovertarget="popover${capitalize(id)}"
        id="popover${capitalize(id)}Button"
        aria-label="${buttonLabel}"
        tabindex="0"
        data-arrow-nav="true"
        role="menuitem"
      > 
        <div class="${styles.likeButtonContent}"
          style="background-image: ${avatarThumb ? `url(${avatarThumb})` : 'none'}"
        />
      </button>`;
  }

  function renderPopoverTop({
    styles,
    avatarThumb,
    profileUrl,
    lang,
  }: {
    styles: CSSModuleClasses;
    avatarThumb: string | undefined;
    profileUrl: string;
    lang: Language;
  }) {
    const fallbackBg =
      'linear-gradient(var(--system-dark-300-55), var(--system-dark-300-80))';
    const avatarStyle = avatarThumb ? `url(${avatarThumb})` : fallbackBg;
    const viewLabel =
      lang === 'da' ? 'Vis profil på Bluesky' : 'View Profile on Bluesky';

    const butterflyIcon = `<svg aria-hidden="true" width="16" height="18" viewBox="0 0 122 107">
            <path d="M60.9002 50.0081C66.209 38.6319 81.3772 17.3965 95.4078 7.15799C105.267 
            -0.42609 121.573 -6.11415 121.573 12.4669C121.573 16.2589 119.298 43.5616 118.16 
            48.112C113.989 63.6594 98.0622 67.4515 84.0316 65.1762C108.68 69.3475 114.747 
            83.378 101.475 97.0294C75.6891 123.194 64.6922 90.5829 61.6586 81.8612L61.5448 
            81.5199C61.2036 80.3823 61.1656 80.0031 60.7864 80.0031C60.4072 80.0031 60.4451 
            80.7615 60.028 81.5199L59.9142 81.8612C56.8806 90.2037 45.8837 123.194 20.0978 
            97.0294C6.44647 83.378 12.8929 69.3475 37.5412 65.1762C23.5107 67.4515 7.58408 
            63.6594 3.41284 48.112C2.27523 43.5616 0 16.2589 0 12.4669C0 -6.11415 16.3058 
            -0.42609 26.1651 7.15799C40.1956 17.7757 54.9846 38.6319 60.6727 50.0081H60.9002Z" 
            fill="currentColor" opacity="0.8">
            </path>
          </svg> `;

    return `
      <div class="${styles.popoverTop}">
        <div class="${styles.avatar}" style="background-image: ${avatarStyle};"></div>
        <a class="${styles.viewProfileOnBluesky}"
          href="${profileUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p>${viewLabel}</p>
          ${butterflyIcon}
        </a>
      </div>`;
  }

  function renderDescription(
    description: string | undefined,
    styles: CSSModuleClasses
  ) {
    if (!description) return '';
    const htmlDesc = linkifyDomains(description, {
      link: styles.descriptionLink,
    });
    return `<span class="small-body-text ${styles.description}">${htmlDesc}</span>`;
  }

  function renderCloseButton(
    id: string,
    styles: CSSModuleClasses,
    title: string
  ) {
    const crossIcon = `<svg xmlns="http://www.w3.org/2000/svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M11.0327 8L15.5814 3.45136C16.1395 2.89318 16.1395 1.98818 15.5814 1.42955L14.5705 
            0.418636C14.0123 -0.139545 13.1073 -0.139545 12.5486 0.418636L8 4.96727L3.45136 0.418636C2.89318 
            -0.139545 1.98818 -0.139545 1.42955 0.418636L0.418636 1.42955C-0.139545 1.98773 -0.139545 2.89273 
            0.418636 3.45136L4.96727 8L0.418636 12.5486C-0.139545 13.1068 -0.139545 14.0118 0.418636 
            14.5705L1.42955 15.5814C1.98773 16.1395 2.89318 16.1395 3.45136 15.5814L8 11.0327L12.5486 
            15.5814C13.1068 16.1395 14.0123 16.1395 14.5705 15.5814L15.5814 14.5705C16.1395 14.0123 16.1395 
            13.1073 15.5814 12.5486L11.0327 8Z"
            fill="currentColor"
            opacity="0.8" 
          />
        </svg>`;

    return html`
      <button
        class="${styles.closeButton}"
        popovertarget="popover${capitalize(id)}"
        title="${title}"
        aria-label="${title}"
      >
        ${crossIcon}
      </button>
    `;
  }

  const markup = html`
    <div class="${styles.popoverWrapper}" style="anchor-name: --${didId};">
      ${renderPopoverButton({
        id: didId,
        styles,
        avatarThumb,
        buttonLabel,
      })}
      <div
        id="popover${capitalize(didId)}"
        class="${styles.popover}"
        data-position="top"
        data-width="${popoverWidth}"
        style="--width: ${popoverWidth}px;"
        popover
      >
        ${renderCloseButton(didId, styles, closeButtonTitle)}
        <div class="${styles.popoverContent}">
          ${renderPopoverTop({ styles, avatarThumb, profileUrl, lang })}
          ${displayName
            ? `<h3 class="${styles.displayName}">${displayName}</h3>`
            : ''}
          <p class="small-body-text ${styles.handle}">@${handle}</p>
          ${renderDescription(like.actor.description, styles)}
        </div>
      </div>
    </div>
  `;
  return markup;
}

/**
 * Generates the full HTML string for the likes section, including avatars and count.
 */
export function createLikesHTML(
  /**  The likes data for a specific thread.*/
  likesResult: LikesResult,
  atUri: string,
  lang: Language
): string {
  const threadLikes = likesResult.find((item) => item.uri === atUri);
  const totalLikes = threadLikes?.likeCount ?? 0;
  const freshLikes =
    threadLikes?.likes.slice(0, MAXIMUM_NUMBER_OF_LIKE_AVATARS) ?? [];

  if (!freshLikes.length) return '';

  const avatarsHTML = freshLikes
    .map((like) =>
      createLikeProfileHTML(like, lang, { ...popoverStyles, ...styles })
    )
    .join('');

  const extraLikesHTML =
    totalLikes > freshLikes.length
      ? `<div class="${styles.additionalLikes}">+${totalLikes - freshLikes.length}</div>`
      : '';

  return `
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
      <path d="M4.99182 0.835242C5.87688 0.684441 6.78451 0.734186 7.64779 0.980813C8.51107 1.22744 9.30799 1.66466 9.97982 2.26024L10.0168 2.29324L10.0508 2.26324C10.692 1.70054 11.4458 1.28104 12.262 1.03273C13.0782 0.784412 13.9379 0.712997 14.7838 0.823243L15.0298 0.859243C16.0961 1.04335 17.0928 1.5124 17.9143 2.21671C18.7358 2.92103 19.3515 3.83439 19.6963 4.86008C20.041 5.88577 20.102 6.9856 19.8727 8.04311C19.6434 9.10062 19.1324 10.0764 18.3938 10.8672L18.2138 11.0522L18.1658 11.0932L10.7158 18.4722C10.5439 18.6424 10.3161 18.7445 10.0747 18.7596C9.83328 18.7746 9.59458 18.7017 9.40282 18.5542L9.30882 18.4722L1.81582 11.0502C1.02204 10.2779 0.457522 9.30092 0.184781 8.22751C-0.0879596 7.1541 -0.058277 6.02614 0.270541 4.96856C0.59936 3.91098 1.21448 2.96504 2.04778 2.23551C2.88109 1.50599 3.90005 1.02134 4.99182 0.835242Z" fill="currentColor" />
    </svg>
    <div class="${styles.avatarStack}" role="menubar">
      ${avatarsHTML}
      ${extraLikesHTML}
    </div>
  `;
}

let devTipsLikesPromise: Promise<LikesResult> | undefined = undefined;
/**
 * Lazily fetches likes data, caching the result for future calls.
 * @returns A promise that resolves with the likes data.
 */
export async function fetchLikesOnce(): Promise<LikesResult> {
  if (!devTipsLikesPromise) {
    devTipsLikesPromise = getDevTipsLikes();
  }
  return devTipsLikesPromise;
}

/**
 * Removes data-with-loader attribute from all matching elements inside the container.
 * @param {HTMLElement} wrapper - The wrapper element containing loader elements.
 */
export function cleanupSkeletonLoaders(wrapper: HTMLDivElement) {
  const loaderElements = wrapper.querySelectorAll('[data-with-loader]');
  loaderElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      delete el.dataset.withLoader;
    }
  });
}

/**
 * Injects the popover script into a given container element.
 */
export function injectPopoverScript(wrapper: HTMLElement) {
  const script = document.createElement('script');
  script.src = '/popover.js';
  script.type = 'text/javascript';
  wrapper.appendChild(script);
}
