import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://larsejaas.com',
  adapter: netlify({
    edgeMiddleware: false,
    functionPerRoute: false,
  }),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'load',
  },
  redirects: {
    '/en': '/',
    '/artikler': '/da',
    '/grafik': '/da',
    '/kompetencer': '/da/kompetencer',
    '/portfolio': '/da/arbejde',
    '/webudvikling': '/da',
    '/en/artikler': '/',
    '/en/grafik': '/en',
    '/en/kompetencer': '/skills',
    '/en/portfolio': '/work',
    '/en/webudvikling': '/',
  },
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: {
    enabled: false,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
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
          main: './src/scripts/restoreScrollPosition.ts',
        },
        output: {
          entryFileNames: 'restoreScrollPosition.min.js',
        },
      },
      define: {
        'import.meta.env.DEV': JSON.stringify(process.env.DEV || false),
      },
    },
  },
});
