import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';

let adapter = netlify({
  edgeMiddleware: false,
  functionPerRoute: false,
});

if (process.argv[3] === '--node' || process.argv[4] === '--node') {
  adapter = node({ mode: 'standalone' });
}

// https://astro.build/config
export default defineConfig({
  site: 'https://larsejaas.com',
  adapter,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
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
      // rollupOptions: {
      //   input: {
      //     main: './src/scripts/restoreScrollPosition.ts',
      //   },
      //   output: {
      //     entryFileNames: 'restoreScrollPosition.min.js',
      //   },
      // },
      define: {
        'import.meta.env.DEV': JSON.stringify(process.env.DEV || false),
      },
    },
  },
});
