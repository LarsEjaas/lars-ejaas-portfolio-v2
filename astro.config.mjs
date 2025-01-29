import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const { createSitemapFilter } = await import(
  /* @vite-ignore */
  new URL('./src/utils/sitemapUtils.mjs', import.meta.url)
);

const { NODE_ENV, SITE_URL: SITE_URL_RAW } = loadEnv(
  process.env.NODE_ENV,
  process.cwd(),
  ''
);

const SITE_URL = SITE_URL_RAW.endsWith('/')
  ? SITE_URL_RAW.slice(0, -1)
  : SITE_URL_RAW;

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  adapter: netlify({
    edgeMiddleware: false,
    functionPerRoute: false,
  }),
  integrations: [
    sitemap({
      xslURL: '/sitemap.xsl',
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          da: 'da-DK',
        },
      },
      filter: createSitemapFilter,
    }),
  ],
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
      minify: NODE_ENV === 'production',
    },
  },
});
