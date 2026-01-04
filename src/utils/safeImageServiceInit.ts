type AstroAsset = {
  _initPromise?: Promise<void>;
  _initComplete?: boolean;
} & typeof globalThis.astroAsset;

let GLOBAL_ASTRO_ASSET = globalThis.astroAsset as AstroAsset;

/**
 * Ensures the image service is initialized
 * This fixes a race condition when starting the development server causing it to throw inside the virtual image service in Astro:assets
 */
async function ensureImageServiceReady(): Promise<void> {
  // Already initialized
  if (GLOBAL_ASTRO_ASSET?._initComplete) {
    return;
  }

  // Already initializing, wait for it
  if (GLOBAL_ASTRO_ASSET?._initPromise) {
    return GLOBAL_ASTRO_ASSET._initPromise;
  }

  // Initialize
  if (!GLOBAL_ASTRO_ASSET) {
    GLOBAL_ASTRO_ASSET = {};
  }

  const initPromise = (async () => {
    try {
      //@ts-expect-error
      const { default: service } = await import('virtual:image-service');
      GLOBAL_ASTRO_ASSET.imageService = service;
      GLOBAL_ASTRO_ASSET._initComplete = true;
    } catch (error) {
      delete GLOBAL_ASTRO_ASSET._initPromise;
      throw error;
    }
  })();

  GLOBAL_ASTRO_ASSET._initPromise = initPromise;

  try {
    await initPromise;
  } finally {
    delete GLOBAL_ASTRO_ASSET._initPromise;
  }
}

// Auto-initialize in dev mode
if (import.meta.env?.DEV) {
  await ensureImageServiceReady();
}
