import { defineConfig, envField } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const { createSitemapFilter, serializeSitemap } = await import(
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
    imageCDN: false,
  }),
  cacheDir: './.cache',
  env: {
    schema: {
      FACEBOOK_APP_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      MAIL_USER: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      MAIL_PASSWORD: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      NOREPLY_PRIVATE_EMAIL_USER: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      PRIVATE_EMAIL_USER: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      NODE_ENV: envField.enum({
        values: ['development', 'production'],
        context: 'client',
        access: 'public',
        optional: false,
      }),
      SITE_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      BLOCK_ALL_INDEXING: envField.boolean({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_PIWIK_SITE_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      PUBLIC_PIWIK_TRACKER_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      PUBLIC_PIWIK_DOMAINS: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
    },
  },
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
      serialize: serializeSitemap,
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
    '/skrivTilMig.html': '/da/kontakt/',
    '/artikler/artikler-kommer-snart/': '/',
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
