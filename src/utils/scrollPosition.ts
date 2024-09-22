import { removeTrailingSlash } from '@i18n/utils';
import {
  getValueFromLocalStorage,
  setValueInLocalStorage,
} from './localStorage';
import { allModalKeys } from '@i18n/routes';

export const storeScrollPosition = (anchor: HTMLAnchorElement) => {
  anchor.addEventListener('click', () => {
    // Store current scroll position
    setValueInLocalStorage('scrollPosition', window.scrollY);
  });
};

export const getStoredScrollPosition = () => {
  // Get stored scroll position
  const rawValue = getValueFromLocalStorage<string>('scrollPosition', '0');
  // Store current scroll position
  return Number(rawValue);
};

export const checkIfPreviousRouteWasModal = () => {
  const previousRoute = removeTrailingSlash(document.referrer);
  // Get the last slug of the previous route
  const possibleModalSlug = previousRoute.split('/').slice(-1)[0];
  const previousRouteWasModal = !!(
    possibleModalSlug &&
    allModalKeys.includes(possibleModalSlug as (typeof allModalKeys)[number])
  );
  return previousRouteWasModal;
};

export const restoreModalScrollPosition = () => {
  const previousRouteWasModal = checkIfPreviousRouteWasModal();
  if (previousRouteWasModal) {
    const scrollPosition = getStoredScrollPosition();
    window.scrollTo({
      top: scrollPosition,
      behavior: 'instant',
    });
  }
};
