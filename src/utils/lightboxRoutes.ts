import { removeTrailingSlash } from '@i18n/utils';
import { lightboxRoutes } from '@collections/aboutImages/aboutImages.mts';

function extractAllLightboxKeys<
  T extends Record<string, readonly [string, string] | string>,
>(
  input: T
): {
  [K in keyof T]: T[K] extends readonly [
    infer EN extends string,
    infer DA extends string,
  ]
    ? EN | DA
    : T[K];
}[keyof T][] {
  return Object.values(input).flatMap((route) =>
    Array.isArray(route) ? route : [route]
  ) as any;
}

const allLightboxKeys = extractAllLightboxKeys(lightboxRoutes);

export const isLightboxRoute = (route: string) => {
  const routeToCheck = removeTrailingSlash(route);
  // Get the last slug of the previous route
  const possibleLightboxSlug = routeToCheck.split('/').slice(-1)[0];
  const routeIsLightbox = !!(
    possibleLightboxSlug &&
    allLightboxKeys.includes(
      possibleLightboxSlug as (typeof allLightboxKeys)[number]
    )
  );
  return routeIsLightbox;
};
