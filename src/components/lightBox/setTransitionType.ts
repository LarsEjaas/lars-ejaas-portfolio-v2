import { TRANSITION_TYPE } from '@utils/localStorage';
import { isLightboxRoute } from '@utils/lightboxRoutes';

export const setLightboxTransitionType = () => {
  if ('CSSViewTransitionRule' in window) {
    window.addEventListener('pageswap', async (e: PageSwapEvent) => {
      if (e.viewTransition) {
        const currentURL = e.activation?.from?.url
          ? new URL(e.activation.from?.url)
          : null;
        const targetURL = new URL(e.activation?.entry.url ?? '');

        let transitionType: 'keep-in-place' | 'fade';

        const currentIsLightbox = currentURL
          ? isLightboxRoute(currentURL?.pathname)
          : false;

        const destinationIsLightbox = isLightboxRoute(targetURL.pathname);

        // page was refreshed or navigating to another lightbox path
        if (
          !currentURL?.pathname ||
          currentURL?.pathname === targetURL.pathname ||
          (destinationIsLightbox && currentIsLightbox)
        ) {
          transitionType = 'keep-in-place';
          e.viewTransition.types.add(transitionType);
          sessionStorage[TRANSITION_TYPE] = transitionType;
          const figure = window.lightbox?.querySelector('figure');
          if (figure && destinationIsLightbox) {
            figure.style.viewTransitionName = 'figure';
          }
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
