/// <reference path="../.astro/types.d.ts" />

interface Window {
  themeToggle: HTMLInputElement | null;
  themeToggleMobile: HTMLInputElement | null;
  carouselList: HTMLDivElement | null;
  previous: HTMLButtonElement | null;
  next: HTMLButtonElement | null;
  modalDialog: HTMLDialogElement | null;
  /** Balloons */
  floating: HTMLDivElement | null;
  two: HTMLDivElement | null;
  three: HTMLDivElement | null;
  four: HTMLDivElement | null;
}
