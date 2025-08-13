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
 * existing tab navigation with horizontal arrow keys navigation left/right.
 * @param {HTMLElement} hostElement - The element to initialize navigation within
 * @param {boolean} [reverse=false] - Whether to reverse the navigation order
 *
 * Each focusable element must manually be marked with the `data-arrow-nav="true"` attribute
 */
export const initHorizontalKeyboardArrowNav = (
  hostElement: HTMLElement,
  reverse?: boolean
) => {
  if (hostElement.dataset.arrowNavInitialized) {
    return;
  }

  const focusableElements = getFocusableElements(hostElement);
  if (!focusableElements.length) {
    console.warn(
      `Arrow navigation not initialized. No focusable elements found inside:`,
      hostElement
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
      // Do not scroll horizontally
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const currentIndex = focusableElements.indexOf(event.target);
      const newIndex = currentIndex + direction;

      if (newIndex >= 0 && newIndex < focusableElements.length) {
        focusableElements[newIndex]?.focus();
      }
      return;
    }

    const allTabElements =
      Array.from(
        document.querySelectorAll(
          'a, button, input, select, textarea, [tabindex]:not([tabindex^="-"])'
        ) as NodeListOf<HTMLElement>
      ).filter((el) => el.tabIndex !== -1) ?? [];

    if (
      event.target instanceof HTMLElement &&
      event.key === 'Tab' &&
      event.shiftKey &&
      !reverse &&
      event.target?.tabIndex !== 0
    ) {
      event.preventDefault();
      event.stopPropagation();

      const newIndex = allTabElements.indexOf(
        focusableElements[0] as HTMLElement
      );
      newIndex > 0
        ? allTabElements[newIndex]?.focus()
        : focusableElements[0]?.focus();
      return;
    }

    /** Do not got to the last tab element if in reverse (visually the last element is the first element) */
    if (
      event.target instanceof HTMLElement &&
      event.key === 'Tab' &&
      !event.shiftKey &&
      reverse &&
      event.target?.tabIndex !== 0
    ) {
      event.preventDefault();

      const newIndex = allTabElements.indexOf(
        focusableElements[0] as HTMLElement
      );
      allTabElements[newIndex + 1]?.focus();
      return;
    }
  };

  focusableElements.forEach((element, index) => {
    element.addEventListener('keydown', handleKeyDown, {
      passive: false,
    });
    if (index !== 0) {
      element.tabIndex = -1;
    } else {
      // This is needed in Safari to make the first element focusable
      element.tabIndex = 0;
    }
  });
  hostElement.dataset.arrowNavInitialized = 'true';
};
