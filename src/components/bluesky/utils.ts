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
import { SERVERLESS_AUTH_TOKEN } from 'astro:env/server';
import { SITE_URL } from 'astro:env/client';
import { removeTrailingSlash } from '../../i18n/utils';

type LikesResult = {
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

export async function getDevTipsLikes(atUris?: string[]): Promise<LikesResult> {
  try {
    const res = await fetch(
      `${SITE_URL}/.netlify/functions/get-dev-tips-likes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SERVERLESS_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          atUris: atUris ?? [], // pass empty array or undefined if no filter
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch likes: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error('❌ Error fetching likes:', error);
    return [];
  }
}

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
