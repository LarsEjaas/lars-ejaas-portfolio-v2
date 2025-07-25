import type { ProcessedPost, ProcessedTextSegment } from './utils';

/**
 * Render configuration for customizing how different content types are rendered
 */
export interface RichTextRenderConfig {
  // Component/element names to use for each type
  components?: {
    text?: string;
    link?: string;
    hashtag?: string;
    container?: string;
  };
  // Custom attributes for each component type
  attributes?: {
    text?: Record<string, any>;
    link?:
      | Record<string, any>
      | ((segment: ProcessedTextSegment) => Record<string, any>);
    hashtag?:
      | Record<string, any>
      | ((segment: ProcessedTextSegment) => Record<string, any>);
    container?: Record<string, any>;
  };
  // Custom class names
  classNames?: {
    text?: string;
    link?: string;
    hashtag?: string;
    container?: string;
  };
}

/**
 * Default render configuration
 */
const defaultRenderConfig: Required<RichTextRenderConfig> = {
  components: {
    text: 'span',
    link: 'a',
    hashtag: 'span',
    container: 'div',
  },
  attributes: {
    text: {},
    link: {},
    hashtag: {},
    container: {},
  },
  classNames: {
    text: '',
    link: 'rich-text-link',
    hashtag: 'rich-text-hashtag',
    container: 'rich-text-content',
  },
};

/**
 * Renders rich text segments as HTML string
 */
export function renderRichTextAsHTML(
  post: ProcessedPost,
  config: RichTextRenderConfig = {}
): string {
  const segments = post.content.segments;
  let renderedEmbed: string = '';

  const finalConfig = {
    components: { ...defaultRenderConfig.components, ...config.components },
    attributes: { ...defaultRenderConfig.attributes, ...config.attributes },
    classNames: { ...defaultRenderConfig.classNames, ...config.classNames },
  } as Required<RichTextRenderConfig>;

  const renderedSegments = segments.map((segment) => {
    switch (segment.type) {
      case 'link': {
        const attrs =
          typeof finalConfig.attributes.link === 'function'
            ? finalConfig.attributes.link(segment)
            : finalConfig.attributes.link;

        const className = finalConfig.classNames.link;
        const classAttr = className ? ` class="${className}"` : '';
        const hrefAttr = segment.uri ? ` href="${segment.uri}"` : '';
        const targetAttr =
          segment.uri && !segment.uri.startsWith('#')
            ? ' target="_blank" rel="noopener noreferrer"'
            : '';

        // Add custom attributes
        const customAttrs = Object.entries(attrs)
          .map(([key, value]) => ` ${key}="${value}"`)
          .join('');

        //internal link
        if (!targetAttr) {
          return `<${finalConfig.components.link}${hrefAttr}${targetAttr}${classAttr}${customAttrs}>${segment.content}</${finalConfig.components.link}>`;
        }
        //external link
        return `<${finalConfig.components.link}${hrefAttr}${targetAttr}${classAttr}${customAttrs}>${segment.content}<svg aria-hidden="true" width="16px" height="16px" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2.5"  stroke-linecap="round"  stroke-linejoin="round"  style="margin-left: 1px; margin-bottom: -2px;"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg></${finalConfig.components.link}>`;
      }

      case 'hashtag': {
        const attrs =
          typeof finalConfig.attributes.hashtag === 'function'
            ? finalConfig.attributes.hashtag(segment)
            : finalConfig.attributes.hashtag;

        const className = finalConfig.classNames.hashtag;
        const classAttr = className ? ` class="${className}"` : '';

        // Add custom attributes
        const customAttrs = Object.entries(attrs)
          .map(([key, value]) => ` ${key}="${value}"`)
          .join('');

        return `<${finalConfig.components.hashtag}${classAttr}${customAttrs}>${segment.content}</${finalConfig.components.hashtag}>`;
      }

      case 'text':
      default: {
        const attrs =
          typeof finalConfig.attributes.text === 'function'
            ? finalConfig.attributes.text(segment)
            : finalConfig.attributes.text;

        const className = finalConfig.classNames.text;
        const classAttr = className ? ` class="${className}"` : '';

        // Add custom attributes
        const customAttrs = Object.entries(attrs)
          .map(([key, value]) => ` ${key}="${value}"`)
          .join('');

        // For plain text, only add span if there are custom attributes or classes
        if (customAttrs || className) {
          return `<${finalConfig.components.text}${classAttr}${customAttrs}>${segment.content}</${finalConfig.components.text}>`;
        }
        return segment.content;
      }
    }
  });

  if (post.embed) {
    switch (post.embed.type) {
      case 'external':
        renderedEmbed = ``;
        break;
      default:
        break;
    }
  }

  const containerClassName = finalConfig.classNames.container;
  const containerClassAttr = containerClassName
    ? ` class="${containerClassName}"`
    : '';

  const containerAttrs =
    typeof finalConfig.attributes.container === 'function'
      ? finalConfig.attributes.container()
      : finalConfig.attributes.container;

  const customContainerAttrs = Object.entries(containerAttrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('');

  return `<${finalConfig.components.container}${containerClassAttr}${customContainerAttrs}>${renderedSegments.join('')}${renderedEmbed}</${finalConfig.components.container}>`;
}

/**
 * Helper function to render a complete post's content as HTML
 */
export function renderPostContentAsHTML(
  post: ProcessedPost,
  config?: RichTextRenderConfig
): string {
  return renderRichTextAsHTML(post, config);
}
