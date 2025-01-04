import { TRANSITION_TYPE } from '@utils/localStorage';
import { removeTrailingSlash } from '@i18n/utils';
import { allLightboxKeys } from '@i18n/routes';

export const setTransitionType = () => {
  if ('CSSViewTransitionRule' in window) {
    window.addEventListener('pageswap', async (e: PageSwapEvent) => {
      if (e.viewTransition) {
        const currentURL = e.activation.from?.url
          ? new URL(e.activation.from?.url)
          : null;
        const targetURL = new URL(e.activation.entry.url);

        let transitionType: 'keep-in-place' | 'fade';

        const currentPathname = currentURL
          ? removeTrailingSlash(currentURL?.pathname)
          : undefined;
        const destinationPathname = removeTrailingSlash(targetURL.pathname);
        const currentKey = currentPathname?.split('/').slice(-1)[0];
        const destinationKey = destinationPathname.split('/').slice(-1)[0];

        const currentIsLightbox = allLightboxKeys.includes(
          currentKey as (typeof allLightboxKeys)[number]
        );

        const destinationIsLightbox = allLightboxKeys.includes(
          destinationKey as (typeof allLightboxKeys)[number]
        );

        // page was refreshed or navigating to a lightbox path
        if (
          !currentPathname ||
          currentPathname === destinationPathname ||
          (destinationIsLightbox && currentIsLightbox)
        ) {
          transitionType = 'keep-in-place';
          e.viewTransition.types.add(transitionType);
          sessionStorage[TRANSITION_TYPE] = transitionType;
          return;
        }
        if (currentIsLightbox && !destinationIsLightbox) {
          transitionType = 'fade';
          e.viewTransition.types.add(transitionType);
        }
      }
    });
  }
};
