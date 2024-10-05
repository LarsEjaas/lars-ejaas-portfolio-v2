import { allLightboxKeys } from '../i18n/routes';
import { removeTrailingSlash } from '../i18n/utils';

export const SCROLL_POSITION_KEY = 'scrollPosition';

export const storeScrollPositionOnClick = (anchor: HTMLAnchorElement) => {
  anchor.addEventListener('click', () => {
    // Store current scroll position
    sessionStorage[SCROLL_POSITION_KEY] = window.scrollY;
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
