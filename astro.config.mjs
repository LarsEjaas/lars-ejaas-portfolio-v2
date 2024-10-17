import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://larsejaas.com',
  base: '/',
  trailingSlash: 'ignore',
  devToolbar: {
    enabled: false,
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'da'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    build: {
      minify: process.env.NODE_ENV === 'production',
      rollupOptions: {
        input: {
          main: './src/scripts/restoreScrollPosition.ts', // Your TypeScript file
        },
        output: {
          entryFileNames: 'restoreScrollPosition.min.js', // Minified output
        },
      },
    },
  },
});
