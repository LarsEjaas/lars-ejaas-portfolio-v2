// functions/utils/sanitizer.ts
import { transformSync } from 'ultrahtml';
import sanitize from 'ultrahtml/transformers/sanitize';

/**
 * Sanitize HTML using ultrahtml
 * transformSync returns a string directly!
 */
export function sanitizeHTML(dirtyHTML: string): string {
  try {
    // transformSync applies transformers and returns a string
    const clean = transformSync(dirtyHTML, [
      sanitize({
        // Allowed tags
        allowElements: [
          'p',
          'br',
          'b',
          'i',
          'em',
          'strong',
          'span',
          'div',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'a',
          'pre',
          'code',
          'blockquote',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'hr',
          'small',
          'sub',
          'sup',
        ],

        // Allowed attributes per element
        allowAttributes: {
          a: ['href', 'target', 'rel', 'class', 'id'],
          div: ['class', 'id', 'style'],
          span: ['class', 'id', 'style'],
          p: ['class', 'id', 'style'],
          td: ['colspan', 'rowspan', 'class'],
          th: ['colspan', 'rowspan', 'class'],
          '*': ['class', 'id'], // Wildcard for all elements
        },

        // Drop dangerous elements
        dropElements: ['script', 'style', 'iframe', 'object', 'embed'],

        // Drop event handler attributes
        dropAttributes: {
          '*': ['on*'], // Drops onclick, onload, etc.
        },

        // Don't allow comments
        allowComments: false,
      }),
    ]);

    return clean;
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    // Fallback: escape everything if parsing fails
    return escapeHTML(dirtyHTML);
  }
}

/**
 * Strict sanitizer - only allows basic text formatting
 */
export function sanitizeHTMLStrict(dirtyHTML: string): string {
  try {
    return transformSync(dirtyHTML, [
      sanitize({
        allowElements: ['p', 'br', 'b', 'i', 'em', 'strong', 'a'],
        allowAttributes: {
          a: ['href', 'rel'],
        },
        dropElements: ['script', 'style', 'iframe', 'object', 'embed'],
        dropAttributes: {
          '*': ['on*', 'style'],
        },
        allowComments: false,
      }),
    ]);
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return escapeHTML(dirtyHTML);
  }
}

/**
 * Custom sanitizer with URL validation for links
 * Uses two-pass approach: first sanitize, then validate URLs
 */
export function sanitizeHTMLWithURLValidation(dirtyHTML: string): string {
  try {
    // First pass: sanitize
    const sanitized = transformSync(dirtyHTML, [
      sanitize({
        allowElements: [
          'p',
          'br',
          'b',
          'i',
          'em',
          'strong',
          'span',
          'div',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'a',
          'pre',
          'code',
          'blockquote',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'hr',
          'small',
          'sub',
          'sup',
        ],
        allowAttributes: {
          a: ['href', 'target', 'rel', 'class', 'id'],
          '*': ['class', 'id', 'style'],
        },
        dropElements: ['script', 'style', 'iframe', 'object', 'embed'],
        dropAttributes: {
          '*': ['on*'],
        },
        allowComments: false,
      }),
    ]);

    // Second pass: validate and fix URLs in anchor tags
    // Use regex to find and fix dangerous hrefs
    const urlFixed = sanitized.replace(
      /<a\s+([^>]*?)href=["']([^"']*?)["']([^>]*?)>/gi,
      (match, before, href, after) => {
        const lowerHref = href.toLowerCase();

        // Block dangerous protocols
        if (
          lowerHref.startsWith('javascript:') ||
          lowerHref.startsWith('data:') ||
          lowerHref.startsWith('vbscript:')
        ) {
          // Remove href attribute entirely
          return `<a ${before}${after}>`;
        }

        // Add security attributes to external links
        if (!href.startsWith('#') && !href.startsWith('/')) {
          // Check if rel already exists
          const hasRel = /rel=["'][^"']*["']/i.test(before + after);
          const hasTarget = /target=["'][^"']*["']/i.test(before + after);

          let attrs = before + after;
          if (!hasRel) {
            attrs += ' rel="noopener noreferrer"';
          }
          if (!hasTarget) {
            attrs += ' target="_blank"';
          }

          return `<a ${attrs} href="${href}">`;
        }

        // Return unchanged for internal links
        return match;
      }
    );

    return urlFixed;
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return escapeHTML(dirtyHTML);
  }
}

/**
 * Fallback HTML escaping function
 */
function escapeHTML(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Strip all HTML tags (plain text only)
 */
export function stripHTML(html: string): string {
  try {
    return transformSync(html, [
      sanitize({
        allowElements: [], // No elements allowed
        allowAttributes: {},
        dropElements: ['*'],
        allowComments: false,
      }),
    ]);
  } catch (error) {
    console.error('Error stripping HTML:', error);
    // Fallback: regex strip
    return html.replace(/<[^>]*>/g, '');
  }
}
