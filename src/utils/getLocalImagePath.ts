/**
 * Converts Astro's virtual filesystem path to a local filesystem path
 * @param vfsPath The virtual filesystem path from Astro
 * @returns Clean local filesystem path
 */
export function getLocalImagePath(vfsPath: string): string {
  // Remove the /@fs/ prefix and any query parameters
  const cleanPath = vfsPath
    .replace('/@fs/', '') // Remove /@fs/ prefix
    .split('?')[0]; // Remove query parameters

  return cleanPath || '';
}
