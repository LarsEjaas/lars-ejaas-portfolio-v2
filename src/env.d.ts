/// <reference path="../.astro/types.d.ts" />

import type { NetlifyLocals } from '@astrojs/netlify';

declare namespace App {
  interface Locals extends NetlifyLocals {}
}

declare global {
  interface WindowEventMap {
    pagereveal: PageRevealEvent;
    pageswap: PageSwapEvent;
  }

  class PageRevealEvent extends Event {
    constructor(public readonly viewTransition: ViewTransition | null) {
      super('pagereveal');
    }
  }

  interface String {
    /** Converts all the alphabetic characters in a string to uppercase. */
    toUpperCase<T extends string>(this: T): Uppercase<T>;
    /** Converts all the alphabetic characters in a string to lowercase. */
    toLowerCase<T extends string>(this: T): Lowercase<T>;
  }

  interface ViewTransitionTypeSet {
    add(value: string): ViewTransitionTypeSet;
    clear(): void;
    delete(value: string): boolean;
    entries(): IterableIterator<[string, string]>;
    forEach(
      callback: (
        value: string,
        value2: string,
        set: ViewTransitionTypeSet
      ) => void
    ): void;
    has(value: string): boolean;
    keys(): IterableIterator<string>;
    readonly size: number;
    values(): IterableIterator<string>;
    [Symbol.iterator](): IterableIterator<string>;
  }

  interface ViewTransition {
    readonly updateCallbackDone: Promise<void>;
    readonly ready: Promise<void>;
    readonly finished: Promise<void>;
    skipTransition(): void;
    types: ViewTransitionTypeSet;
  }

  type NavigationHistoryEntry = {
    id: string;
    index: number;
    key: string;
    ondispose: (callback: () => void) => void;
    sameDocument: boolean;
    url: string;
  };

  type NavigationActivation = {
    entry: NavigationHistoryEntry;
    from: NavigationHistoryEntry;
    navigationType: 'push' | 'reload' | 'replace' | 'traverse';
  };

  type Navigation = {
    canGoBack?: boolean;
    canGoForward?: boolean;
    from?: string | null;
    activation?: NavigationActivation;
  };

  interface Window {
    contactButton: HTMLAnchorElement | null;
    footerMenuContact: HTMLAnchorElement | null;
    mainContent: HTMLElement | null;
    tldr: HTMLDivElement | null;
    gotoDldr: HTMLAnchorElement | null;
    scrollToTop: HTMLAnchorElement | null;
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
    mobileShareLink: HTMLAnchorElement | null;
    mobileContactLink: HTMLAnchorElement | null;
    desktopShareLink: HTMLAnchorElement | null;
    desktopContactLink: HTMLAnchorElement | null;
    skillTileScene: HTMLDivElement | null;
    lightbox: HTMLDialogElement | null;
    thumbnailGridContainer: HTMLDivElement | null;
    aboutArticle: HTMLElement | null;
    skillBackButton: HTMLButtonElement | null;
    skillPagination: HTMLUListElement | null;
    skillPresentation: HTMLDivElement | null;
    errorMessage: HTMLParagraphElement | null;
    richtextEditor: HTMLDivElement | null;
    contactTextArea: HTMLTextAreaElement | null;
    writeToMe: HTMLFormElement | null;
    firstName: HTMLTableCellElement | null;
    //404 page
    goBack: HTMLDivElement | null;
    navigation: Navigation;
    onpagereveal?: (event: PageRevealEvent) => void;
    onpageswap?: (event: PageSwapEvent) => void;
  }

  interface Document {
    startViewTransition: ((callbackfn: () => void) => void) | undefined;
  }
}
