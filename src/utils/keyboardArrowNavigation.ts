/** Get all focusable child elements marked with `data-arrow-nav` */
export const getFocusableElements = (
  hostElement: HTMLElement = document.documentElement
): Array<HTMLElement> => {
  const elements = Array.from(
    (hostElement?.querySelectorAll(
      'a[data-arrow-nav]:not([aria-disabled]), button:not(:disabled)[data-arrow-nav], textarea[data-arrow-nav], input[data-arrow-nav]'
    ) as NodeListOf<HTMLElement>) ?? []
  );
  return elements;
};

/**
 * Create keyboard navigation within this element. Replaces the
 * existing tab navigation with arrow keys navigation left/right.
 * @param {HTMLElement} hostElement - The element to initialize navigation within
 * @param {boolean} [reverse=false] - Whether to reverse the navigation order
 *
 * Each focusable element must manually be marked with the `data-arrow-nav="true"` attribute
 */
export const initializeKeyboardArrowNavigation = (
  hostElement: HTMLElement,
  reverse?: boolean
) => {
  if (hostElement.dataset.arrowNavInitialized) {
    return;
  }

  const focusableElements = getFocusableElements(hostElement);
  if (!focusableElements.length) {
    console.warn(
      'No focusable elements found. Arrow navigation not initialized.'
    );
    return;
  }
  if (reverse) {
    focusableElements.reverse();
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
      event.target instanceof HTMLElement
    ) {
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const currentIndex = focusableElements.indexOf(event.target);
      const newIndex = currentIndex + direction;

      if (newIndex >= 0 && newIndex < focusableElements.length) {
        focusableElements[newIndex]?.focus();
      }
    }
  };

  focusableElements.forEach((element, index) => {
    element.addEventListener('keydown', handleKeyDown, { passive: true });
    if (index !== 0) {
      element.tabIndex = -1;
    } else {
      // This is needed in Safari to make the first element focusable
      element.tabIndex = 0;
    }
  });
  hostElement.dataset.arrowNavInitialized = 'true';
};
