/// <reference path="../.astro/types.d.ts" />

interface Window {
  themeToggle: HTMLInputElement | null;
  themeToggleMobile: HTMLInputElement | null;
  carouselList: HTMLDivElement | null;
  previous: HTMLButtonElement | null;
  next: HTMLButtonElement | null;
  modalDialog: HTMLDialogElement | null;
  desktopMenuContainer: HTMLDivElement | null;
  footerMenuNavigation: HTMLElement | null;
  mobileMenuNavigation: HTMLElement | null;
  /** Balloons */
  floating: HTMLDivElement | null;
  two: HTMLDivElement | null;
  three: HTMLDivElement | null;
  four: HTMLDivElement | null;
}

interface String {
  /** Converts all the alphabetic characters in a string to uppercase. */
  toUpperCase<T extends string>(this: T): Uppercase<T>;
  /** Converts all the alphabetic characters in a string to lowercase. */
  toLowerCase<T extends string>(this: T): Lowercase<T>;
}

interface Document {
  startViewTransition: ((callbackfn: () => void) => void) | undefined;
}
