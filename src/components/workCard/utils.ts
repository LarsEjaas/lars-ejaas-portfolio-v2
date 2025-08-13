import { initHorizontalKeyboardArrowNav } from '@utils/keyboardArrowNavigation';

export function setupPaginationScroll() {
  const footerImageControls = document.querySelectorAll(
    '[id$="footerNavigation"]'
  );
  const footerImageControlsArray = Array.from(footerImageControls);
  footerImageControlsArray.forEach((control) => {
    if (control instanceof HTMLElement) {
      initHorizontalKeyboardArrowNav(control);
      const buttons = control.querySelectorAll('a');
      const controlButtonsArray = Array.from(buttons);
      controlButtonsArray.forEach((controlButton) => {
        if (controlButton instanceof HTMLElement) {
          controlButton.addEventListener('click', (e) => {
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
          });
        }
      });
    }
  });
}
