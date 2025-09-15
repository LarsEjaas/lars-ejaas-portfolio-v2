/**
 * @file This script provides a polyfill for CSS anchor positioning.
 * It serves as a fallback for browsers that do not support the `anchor-name`
 * CSS property, ensuring that popover elements are positioned correctly
 * relative to their trigger buttons.
 */

if (!CSS.supports('anchor-name: --a')) {
  const popovers = document.querySelectorAll<HTMLDivElement>(
    'div[id^="popover"]:not([data-initialized])'
  );

  popovers.forEach((popover) => {
    popover.dataset.initialized = 'true';

    const id = popover.id.replace('popover', '');
    const button = document.querySelector<HTMLButtonElement>(
      `#popover${id}Button`
    );
    const wrapper = popover.parentElement;

    if (button && wrapper) {
      const position = popover.dataset.position || 'bottom';

      const updatePosition = () => {
        const wrapperRect = wrapper.getBoundingClientRect();
        const left = wrapperRect.left + window.scrollX - 8;

        if (position === 'top') {
          requestAnimationFrame(() => {
            const popoverHeight = popover.offsetHeight;
            popover.style.top = `${wrapperRect.top + window.scrollY - popoverHeight - 8}px`;
            popover.style.bottom = 'auto';
          });
        } else {
          popover.style.top = `${wrapperRect.top + wrapperRect.height + window.scrollY + 8}px`;
        }
        popover.style.left = `${left}px`;
      };

      button.addEventListener('click', updatePosition);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, { passive: true });
    }
  });
}
