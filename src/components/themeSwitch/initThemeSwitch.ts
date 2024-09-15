// themeSwitch.mjs
import { setValueInLocalStorage, DARKMODE_KEY } from '@utils/localStorage';

/** Convert the strings 'true' and 'false' to a boolean. */
const stringToBoolean = (str: 'true' | 'false'): boolean => str === 'true';

/** Add a class to the root element to trigger CSS color transition on all elements. */
const addThemeTransition = () => {
  const rootElement = document.documentElement;
  rootElement.classList.add('theming');
  setTimeout(() => {
    rootElement.classList.remove('theming');
  }, 500);
};
/**
 * Initializes the theme switch functionality
 */
export const initThemeSwitch = () => {
  const rootElement = document.documentElement;
  // Check if the theme switch has already been initialized
  if (rootElement.dataset.themeSwitchInitialized === 'true') {
    return;
  }
  rootElement.dataset.themeSwitchInitialized = 'true';
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  /**
   * Toggles the theme between light and dark mode.
   */
  const toggleTheme = (event: MouseEvent) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    addThemeTransition();
    const wasDarkMode = rootElement.dataset.darkMode === 'true';
    setValueInLocalStorage(DARKMODE_KEY, !wasDarkMode);
    // Toggle the dark theme on the root element to the opposite of the current state
    rootElement.dataset.darkMode = wasDarkMode ? 'false' : 'true';
    // Update the state on the other theme toggle (mobile/desktop)
    const toggleId = event.target.id as 'themeToggle' | 'themeToggleMobile';
    if (toggleId === 'themeToggleMobile' && window.themeToggle) {
      window.themeToggle.checked = event.target.checked;
    } else {
      if (window.themeToggleMobile) {
        window.themeToggleMobile.checked = event.target.checked;
      }
    }
  };

  /**
   * Handles changes to the user's preferred color scheme.
   */
  function handleColorSchemeChange(event: MediaQueryListEvent) {
    addThemeTransition();
    if (event.matches) {
      // Dark mode is preferred
      rootElement.dataset.darkMode = 'true';
      setValueInLocalStorage(DARKMODE_KEY, true);
      if (
        window.themeToggle instanceof HTMLInputElement &&
        window.themeToggleMobile instanceof HTMLInputElement
      ) {
        window.themeToggle.checked = true;
        window.themeToggleMobile.checked = true;
      }
    } else {
      // Light mode is preferred
      rootElement.dataset.darkMode = 'false';
      setValueInLocalStorage(DARKMODE_KEY, false);
      if (
        window.themeToggle instanceof HTMLInputElement &&
        window.themeToggleMobile instanceof HTMLInputElement
      ) {
        window.themeToggle.checked = false;
        window.themeToggleMobile.checked = false;
      }
    }
  }

  darkModeMediaQuery.addEventListener('change', handleColorSchemeChange, {
    passive: true,
  });

  /** Disable animation for the initial state (otherwise the toggle will animate on every navigation) */
  const enableToggleAnimations = () => {
    setTimeout(() => {
      delete window.themeToggle?.dataset.animationDisabled;
      delete window.themeToggleMobile?.dataset.animationDisabled;
    }, 500);
  };

  if (
    window.themeToggle instanceof HTMLInputElement &&
    window.themeToggleMobile instanceof HTMLInputElement
  ) {
    window.themeToggle.addEventListener('click', toggleTheme, {
      passive: true,
    });
    window.themeToggleMobile.addEventListener('click', toggleTheme, {
      passive: true,
    });

    /*set initial toggle state based on the current system theme*/
    if (
      rootElement.dataset.darkMode === 'true' ||
      rootElement.dataset.darkMode === 'false'
    ) {
      window.themeToggle.checked = stringToBoolean(
        rootElement.dataset.darkMode
      );
      window.themeToggleMobile.checked = stringToBoolean(
        rootElement.dataset.darkMode
      );
      enableToggleAnimations();
    }
  }
};
