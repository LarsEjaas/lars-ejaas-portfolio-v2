/** Define all routes in the application */
export const appRoutes = {
  en: {
    //modals
    contact: 'kontakt',
    share: 'del',
  },
  da: {
    //modaler
    kontakt: 'contact',
    del: 'share',
  },
} as const;

export type EnglishModalTypes = keyof typeof appRoutes.en;
export type DanishModalTypes = keyof typeof appRoutes.da;
