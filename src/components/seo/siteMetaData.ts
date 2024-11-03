import type { OpenGraph, SeoProps } from '@customTypes/seo';
import type { DeepRequired } from '@customTypes/index';

const FACEBOOK_APP_ID = import.meta.env.FACEBOOK_APP_ID;

/** Default site metadata */
export const getDefaultSiteMetaData = (
  lang: 'en' | 'da'
): DeepRequired<SeoProps> => {
  const isDefaultlang = lang === 'en';
  return {
    metaData: {
      siteUrl: 'https://larsejaas.com',
      keywords: [],
      title: isDefaultlang
        ? 'Lars Ejaas | Passionate About Web Development with Attention to Details'
        : 'Lars Ejaas | Passioneret omkring webudvikling med fokus på detaljen',
      description: isDefaultlang
        ? '👨🏻‍💻 Frontend developer from Denmark. Passionate about web design and web development. Check out my portfolio and get an overview of my development skills.'
        : '👨🏻‍💻 Frontend-udvikler fra Aarhus. Brænder for hjemmesidedesign og webudvikling. Få et overblik over mine kompetencer og udviklingsmetoder jeg har erfaring med.',
      author: 'Lars Ejaas',
      language: isDefaultlang ? 'en' : 'da',
      rights: isDefaultlang
        ? 'All rights reserved Lars Ejaas. Please contact me directly to get my consent before using any content from this page.'
        : 'Alle rettigheder forbeholdes Lars Ejaas. Kontakt mig direkte for at få mit samtykke, inden du bruger indhold fra denne side.',
    },
    metaTheme: {
      favicons: {
        sizes: [
          {
            path: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACB1BMVEUAAAAAjqIAh50AiJ0Qoq4Ah53C8vEAh51M1tMQs7i48e+x7ewAiZ607+0ArbfA8fAlubsAh50ArbcArbcAh51i3dkAh51y4N4Arbdg3NrB8vAVs7cAiJ0tw8DE8vEAh50ewMQXs7YAh50GorE/1NC58O6L5uQ+1NItw8Ci6+kLlaOu7euT5+UArbcvx8OE5OI00s5G19Nm3dowy8e/8e8ArbfA8fBC19IAh50rv7y+8e984+Cu7Oua6eey7uyq7esBrre27u5Pys8ArbdO2dW98e9g3dnA8fAArrcyzssap6wqvLlZ29h24eDF8vIAh53F8vE609AAh5wAh50Ah50/1dPF8/Ki6unF8vEtxMCy7u1m3tvD8fG/8fEAhp3D8vJa3tYAh50Arbcvx8S38O6X6eeB4+E61dGg6uiH5eNx4N1p39xS2dYyz8yn7OqQ5+VJ2NQ008+K5uR54uB34t9E1tMrv7yZ6eeT5+Vz4N5j3dph3dpa3NhY29iw7exL2NUwzMgwy8ei6ulr39xC1tI81dEtxMCy7uxU2tYyzsvB8fCo7OuC5OE208+E5OJ64+Bo3ttl3dpc3NlV2tcpvLktxMF14d5M2dVG19OU5+U00s8hu8EHkaICip+p7euj6+mL5uRu2NkjtrYZq7MaqK8Om6iM5OJ83d5Tz9IswsAStL0cr7cIkqRSpKzoAAAAYXRSTlMAEOpXBfaDfjwbFhAH9fTs4tjMw8GkpJpzVlNHR0E9PDMnJhYU+vf39/T08O7u6ejj4uHc2NTQ0MzLxcXEw8C4uKqqp6Cbk5CFg3p5eHd2dnR0c3BrZmVcWVVMMiwmHRwIWj75BQAAAYtJREFUOMttzNVaI0EAROEKCXHcYRdZWHd3d3fHJri7u7trAsEdHpKeHulu4L89XxWIxAQbVPbk2Ohfn8zmL39i06AyvAm5GRxpAuCIfnnvRkC/IuDW6xTa44NdhH+M/d9Tv0zRSbMdwHMX9ezB+WZdj8rvkQPwl/Pccnsxb0CxsPDYgYty38wVtKsWF8/+RgjpG1miGuYhIl07yyW8Wsbtdl+A7clWnqCcs7R0CrCOZIsGFcPUZeBjJaeCMyK7D0TkC+qYaSICCBulCgQdmijgVQNTz4xR1/4DH5qYRmacCksHogoFvaoJygogqZTXopshXkB2u1NTxZklrloh+5oj6tKc/gkq/orH4ynjDSkCE6F426cqEux6Qw2gkq63aVp1bateyfcYFMcvZRxUvS4RRihMf890a6Zk26t7JLMH8nG3mllZm5eooBPQ2d4HTlIra+skK8Kd4CXEvDs375UYH3IgSr0jcXy/4xAjv//sxCHOcL0HGU04gsHiQ9ehFgOOZor7YflmjGN5H5sXT+0WDDH8AAAAAElFTkSuQmCC',
            size: 32,
            type: 'image/png',
          },
          {
            path: 'data:image/png;base64,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',
            size: 64,
            type: 'image/png',
          },
        ],
      },
      themeColor: '#00879d',
      appleTouchIcon: {
        sizes: [48, 72, 96, 144, 192, 256, 384, 512],
        path: '/icons/',
      },
    },
    facebook: {
      appId: FACEBOOK_APP_ID,
    },
    twitter: {
      creator: 'Lars Ejaas',
      site: 'larsejaas.com',
      cardType: 'summary_large_image',
      siteId: '',
      creatorId: '',
    },
    openGraph: {
      image: isDefaultlang ? 'home_en' : 'home_da',
      imageAlt: '',
    } as OpenGraph,
  };
};
