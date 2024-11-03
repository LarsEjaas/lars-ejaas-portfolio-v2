import { setValueInLocalStorage, DARKMODE_KEY } from '@utils/localStorage';

type ThemeLabel = {
  en: { dark: string; light: string };
  da: { dark: string; light: string };
};

const THEME_LABELS: ThemeLabel = {
  en: {
    dark: 'Switch to dark mode',
    light: 'Switch to light mode',
  },
  da: {
    dark: 'Skift til mørkt tema',
    light: 'Skift til lyst tema',
  },
};

/** Handles the theme switch toggles and updates the theme accordingly. */
class ThemeManager {
  private root = document.documentElement;
  private darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private toggles: HTMLInputElement[] = [];

  constructor() {
    if (this.root.dataset.themeSwitchInitialized === 'true') return;
    this.root.dataset.themeSwitchInitialized = 'true';

    this.initToggles();
    this.setupEventListeners();
    this.enableToggleAnimations();
  }

  private initToggles() {
    const toggles = [window.themeToggle, window.themeToggleMobile].filter(
      (toggle): toggle is HTMLInputElement => toggle instanceof HTMLInputElement
    );

    if (toggles.length === 0) return;

    this.toggles = toggles;
    const isDark = this.root.dataset.darkMode === 'true';

    toggles.forEach((toggle) => {
      toggle.checked = isDark;
      this.updateToggleLabel(toggle);
    });
  }

  private setupEventListeners() {
    this.darkModeQuery.addEventListener(
      'change',
      (e) => this.handleSystemThemeChange(e),
      {
        passive: true,
      }
    );

    this.toggles.forEach((toggle) => {
      toggle.addEventListener('click', (e) => this.handleToggle(e), {
        passive: true,
      });
      toggle.addEventListener('keydown', (e) => this.handleToggle(e), {
        passive: true,
      });
    });
  }

  private handleToggle(event: MouseEvent | KeyboardEvent) {
    if (!(event.target instanceof HTMLInputElement)) return;
    if ('key' in event && event.key !== 'Space' && event.key !== 'Enter')
      return;

    if ('key' in event) {
      event.target.checked = !event.target.checked;
    }

    this.addThemeTransition();
    const isDark = !this.isDarkMode();

    this.setTheme(isDark);
    this.toggles.forEach((toggle) => {
      toggle.checked = isDark;
      this.updateToggleLabel(toggle);
    });
  }

  private handleSystemThemeChange(event: MediaQueryListEvent) {
    this.addThemeTransition();
    this.setTheme(event.matches);
    this.toggles.forEach((toggle) => {
      toggle.checked = event.matches;
      this.updateToggleLabel(toggle);
    });
  }

  private updateToggleLabel(toggle: HTMLInputElement) {
    const parent = toggle.parentElement;
    if (!(parent instanceof HTMLDivElement)) return;

    const lang = (parent.dataset.lang as keyof ThemeLabel) || 'en';
    const label = toggle.checked
      ? THEME_LABELS[lang].light
      : THEME_LABELS[lang].dark;

    parent.setAttribute('aria-label', label);
    parent.setAttribute('title', label);
  }

  private addThemeTransition() {
    this.root.classList.add('theming');
    setTimeout(() => this.root.classList.remove('theming'), 500);
  }

  private isDarkMode(): boolean {
    return this.root.dataset.darkMode === 'true';
  }

  private setTheme(isDark: boolean) {
    this.root.dataset.darkMode = String(isDark);
    setValueInLocalStorage(DARKMODE_KEY, isDark);
  }

  private enableToggleAnimations() {
    setTimeout(() => {
      this.toggles.forEach((toggle) => {
        delete toggle.dataset.animationDisabled;
      });
    }, 500);
  }
}

export const initThemeSwitch = () => new ThemeManager();
