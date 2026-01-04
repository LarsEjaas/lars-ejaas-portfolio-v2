/**
 * Restores scroll position on page load.
 * This function is designed to be called on `DOMContentLoaded` or `pagereveal`.
 */
function restoreScrollPosition(): void {
  const scrollPosition = Number(sessionStorage.getItem('scrollPosition')) || 0;

  // Check if the referrer is from the same origin.
  const isFromSameOrigin = document.referrer.startsWith(window.location.origin);

  if (scrollPosition && isFromSameOrigin) {
    window.scrollTo({
      top: scrollPosition,
      behavior: 'instant',
    });
  }

  const isModalOpen = window.modalDialog || window.lightbox;

  // Clear the initial scroll position if we are on a page with no modal,
  // or if the navigation is not from the same origin.
  if (!isModalOpen || !isFromSameOrigin) {
    sessionStorage.removeItem('scrollPosition');
  }
}

type Theme = 'light' | 'system' | 'dark';

/**
 * Gets the dark mode setting from localStorage.
 * @returns The stored value or false if not set.
 */
function getStoredTheme(): Theme | 'true' | 'false' | null {
  try {
    const raw = localStorage.getItem('ejaas_dark_mode');
    if (!raw) return null;

    const value = JSON.parse(raw);
    return ['true', 'false', 'light', 'system', 'dark'].includes(value)
      ? value
      : null;
  } catch {
    return null;
  }
}

// --- Main script execution ---

// 1. Set JS-enabled flag
document.documentElement.dataset.jsEnabled = 'true';

// 2. Get stored theme
const storedTheme = getStoredTheme();

// 3. Normalize legacy boolean strings to new theme values
const theme: Theme =
  storedTheme === 'true'
    ? 'dark'
    : storedTheme === 'false'
      ? 'light'
      : (storedTheme as Theme) || 'system';

// 4. Apply theme immediately to prevent FOUC
document.documentElement.dataset.theme = theme;

// 5. Set up scroll restoration
if ('onpagereveal' in window) {
  window.onpagereveal = () => restoreScrollPosition();
} else {
  document.addEventListener('DOMContentLoaded', restoreScrollPosition);
}
