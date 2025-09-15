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

/**
 * Gets the dark mode setting from localStorage.
 * @returns {'true' | 'false' | false} The stored value or false if not set.
 */
function getStoredDarkMode(): 'true' | 'false' | false {
  if (
    typeof window.localStorage !== 'undefined' &&
    localStorage.getItem('ejaas_dark_mode')
  ) {
    const value = localStorage.getItem('ejaas_dark_mode');
    if (value === 'true' || value === 'false') {
      return value;
    }
  }
  return false;
}

// --- Main script execution ---

// 1. Set JS-enabled flag
document.documentElement.dataset.jsEnabled = 'true';

// 2. Apply dark mode immediately to prevent FOUC
const storedMode = getStoredDarkMode();
if (
  storedMode === 'true' ||
  (storedMode === false &&
    window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.dataset.darkMode = 'true';
}

// 3. Set up scroll restoration
if ('onpagereveal' in window) {
  window.onpagereveal = () => restoreScrollPosition();
} else {
  document.addEventListener('DOMContentLoaded', restoreScrollPosition);
}
