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

/** Reset focus to first element when tabbing back into the section */
function resetTabindex(
  rootElement: HTMLElement,
  navigationElements: HTMLElement[]
): () => void {
  const handleFocusIn = (e: FocusEvent) => {
    if (
      !(e.target instanceof HTMLElement) ||
      !(e.target?.dataset?.arrowNav === 'true')
    ) {
      return;
    }
    // Reset tabindex to only make first element focusable every time we tab into the section
    if (
      e.relatedTarget instanceof Node &&
      !rootElement.contains(e.relatedTarget)
    ) {
      navigationElements.forEach((item, index) => {
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      });
      navigationElements[0]?.focus();
    }
  };
  rootElement.addEventListener('focusin', handleFocusIn);

  return () => {
    rootElement.removeEventListener('focusin', handleFocusIn);
  };
}

/**
 * Create keyboard navigation within this element. Replaces the
 * existing tab navigation with horizontal arrow keys navigation left/right.
 * @param {HTMLElement} hostElement - The element to initialize navigation within
 * @param {boolean} [reverse=false] - Whether to reverse the navigation order
 *
 * Each focusable element must manually be marked with the `data-arrow-nav="true"` attribute
 * @example
 * const cleanupArrowNav = initHorizontalKeyboardArrowNav(control);
 */
export function initHorizontalKeyboardArrowNav(
  hostElement: HTMLElement,
  reverse?: boolean,
  preventDefault: boolean = true
): (() => void) | undefined {
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

  focusableElements.forEach((el, i) => {
    el.dataset.index = String(i);
    el.tabIndex = i === 0 ? 0 : -1;
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!(event.target instanceof HTMLElement)) return;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      preventDefault && event.preventDefault();

      const current = Number(event.target.dataset.index ?? -1);
      if (current === -1) return;

      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const next = current + direction;

      if (
        next >= 0 &&
        next < focusableElements.length &&
        focusableElements[next]
      ) {
        focusableElements[next].tabIndex = 0; //make the new element focusable
        focusableElements[next].focus();
        event.target.tabIndex = -1; // remove from tab order
      }
    }
  };

  hostElement.addEventListener('keydown', handleKeyDown);

  const cleanupTabindex = resetTabindex(hostElement, focusableElements);

  hostElement.dataset.arrowNavInitialized = 'true';

  return () => {
    hostElement.removeEventListener('keydown', handleKeyDown);
    cleanupTabindex();
    delete hostElement.dataset.arrowNavInitialized;
  };
}

/**
 * Create keyboard navigation within this element. Replaces the
 * existing tab navigation with vertical arrow keys navigation up/down.
 * @param {HTMLElement} hostElement - The element to initialize navigation within
 *
 * Each focusable element must manually be marked with the `data-arrow-nav="true"` attribute
 * @example
 * const cleanupArrowNav = initVerticalKeyboardArrowNav(control);
 */
export function initVerticalKeyboardArrowNav(
  hostElement: HTMLElement
): (() => void) | undefined {
  if (hostElement.dataset.arrowNavInitialized) return;

  const focusableElements = getFocusableElements(hostElement);
  if (!focusableElements.length) {
    console.warn(
      'Arrow navigation not initialized, no focusable elements:',
      hostElement
    );
    return;
  }

  focusableElements.forEach((el, i) => {
    el.dataset.index = String(i);
    el.tabIndex = i === 0 ? 0 : -1;
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!(event.target instanceof HTMLElement)) return;

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();

      const current = Number(event.target.dataset.index ?? -1);
      if (current === -1) return;

      const direction = event.key === 'ArrowUp' ? -1 : 1;
      const next = current + direction;

      if (
        next >= 0 &&
        next < focusableElements.length &&
        focusableElements[next]
      ) {
        focusableElements[next].tabIndex = 0; //make the new element focusable
        focusableElements[next].focus();
        event.target.tabIndex = -1; // remove from tab order
      }
    }
  };

  hostElement.addEventListener('keydown', handleKeyDown);

  const cleanupTabindex = resetTabindex(hostElement, focusableElements);

  hostElement.dataset.arrowNavInitialized = 'true';

  return () => {
    hostElement.removeEventListener('keydown', handleKeyDown);
    cleanupTabindex();
    delete hostElement.dataset.arrowNavInitialized;
  };
}
