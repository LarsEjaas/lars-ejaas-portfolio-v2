import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://larsejaas.com',
  base: '/',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'da'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
