import { initHorizontalKeyboardArrowNav } from '@utils/keyboardArrowNavigation';

/**
 * Enhances anchor-based pagination controls with smooth scrolling and keyboard navigation.
 *
 * This function overrides the default browser behavior for anchor links. Instead of an
 * instant page jump, it smoothly scrolls the target element into view within its container.
 * It also initializes horizontal arrow key navigation (left/right) for the pagination controls,
 * making them fully accessible.
 *
 * @param {Element[]} elements - An array of container elements, each holding a set of pagination anchor links.
 * @returns {() => void} A cleanup function that removes all event listeners added by this setup.
 */
export function setupPaginationScroll(elements: Element[]): () => void {
  const cleanups: (() => void)[] = [];

  elements.forEach((control) => {
    if (control instanceof HTMLElement) {
      const cleanupArrowNav = initHorizontalKeyboardArrowNav(control);
      if (cleanupArrowNav) {
        cleanups.push(cleanupArrowNav);
      }

      const buttons = control.querySelectorAll('a');
      const controlButtonsArray = Array.from(buttons);

      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        const scrollTarget = document.querySelector(
          `#${(e.currentTarget as HTMLAnchorElement).href.split('#')[1]}`
        );
        if (scrollTarget instanceof HTMLElement) {
          scrollTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start',
          });
        }
      };

      controlButtonsArray.forEach((controlButton) => {
        if (controlButton instanceof HTMLElement) {
          controlButton.addEventListener('click', handleClick);
          cleanups.push(() => {
            controlButton.removeEventListener('click', handleClick);
          });
        }
      });
    }
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
