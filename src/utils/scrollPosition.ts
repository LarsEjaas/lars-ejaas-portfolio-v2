import { allLightboxKeys } from '@i18n/routes';
import { removeTrailingSlash } from '@i18n/utils';

export const SCROLL_POSITION_KEY = 'scrollPosition';

/** Store the current scroll position in session storage.
 *
 * Pass a specific element reference to scroll to the elements current top position (buffer in postive or negative
 * number can be added to scroll a bit further/less).
 */
export const storeScrollPositionOnClick = (
  anchor: HTMLAnchorElement,
  element?: HTMLElement,
  scrollBuffer = 0
) => {
  anchor.addEventListener('click', () => {
    // Store current scroll position
    sessionStorage[SCROLL_POSITION_KEY] =
      typeof element?.offsetTop === 'number'
        ? element?.offsetTop + scrollBuffer
        : window.scrollY;
  });
};

export const checkIfPreviousRouteWasLightbox = () => {
  const previousRoute = removeTrailingSlash(document.referrer);
  // Get the last slug of the previous route
  const possibleLightboxSlug = previousRoute.split('/').slice(-1)[0];
  const previousRouteWasLightbox = !!(
    possibleLightboxSlug &&
    allLightboxKeys.includes(
      possibleLightboxSlug as (typeof allLightboxKeys)[number]
    )
  );
  return previousRouteWasLightbox;
};
