import { SCROLL_POSITION_KEY } from '../utils/scrollPosition';

const restoreModalScrollPosition = () => {
  const scrollPosition =
    Number(sessionStorage.getItem('SCROLL_POSITION_KEY')) || 0;
  const referrerIsSameHost = document.referrer.startsWith(
    window.location.origin
  );
  if (scrollPosition && referrerIsSameHost) {
    window.scrollTo({
      top: scrollPosition,
      behavior: 'instant',
    });
  }
  //check if this route includes a modal or lightbox
  const routeIncludesModal = window.modalDialog || window.lightbox;
  if (!routeIncludesModal || !referrerIsSameHost) {
    sessionStorage.removeItem(SCROLL_POSITION_KEY);
  }
};

if ('onpagereveal' in window) {
  window.onpagereveal = () => restoreModalScrollPosition();
} else {
  document.addEventListener('DOMContentLoaded', restoreModalScrollPosition);
}
