import sharp from 'sharp';
import fs from 'fs';
import { removeLeadingSlash } from '@i18n/utils';

async function getImageBuffer(imagePath: string) {
  const path = removeLeadingSlash(imagePath);
  const MAX_RETRIES = 20;
  const DELAY_MS = 100;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await fs.promises.access(path);
      return await fs.promises.readFile(path);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  throw new Error(
    `Timed out waiting for image file to become available: ${path}`
  );
}

const images = import.meta.glob('/src/assets/**/*.{jpg,jpeg,png}');
const publicImages = import.meta.glob('/public/**/*.{jpg,jpeg,png}');

const BLUR_SIGMA = 2;

export function generateBlurPlaceholder(
  imagePath: string,
  width?: number,
  height?: never,
  blurSigma?: number,
  publicAsset?: boolean
): Promise<string | null>;

export function generateBlurPlaceholder(
  imagePath: string,
  width: null,
  height: number,
  blurSigma?: number,
  publicAsset?: boolean
): Promise<string | null>;

/** Generates a base64 blur placeholder for the supplied image. */
export async function generateBlurPlaceholder(
  imagePath: string,
  width?: number | null,
  height?: number | null,
  blurSigma?: number,
  publicAsset?: boolean
): Promise<string | null> {
  //get the filename without extension
  const imageName = imagePath.split('?')[0]?.split('/').pop()?.split('.')[0];

  if (!imageName) {
    throw new Error(`no imageName found for: ${imagePath.split('?')[0]}`);
  }

  const matches = Object.entries(publicAsset ? publicImages : images).filter(
    ([filePath]) =>
      filePath.split('/').at(-1)?.split('.').slice(0, -1)[0] === imageName
  );

  if (matches.length > 1) {
    const paths = matches.map(([path]) => path).join('\n  - ');
    throw new Error(
      `Multiple images found with the same filename: "${imageName}".\n` +
        `generateBlurPlaceholder requires unique filenames.\n` +
        `Conflicting files:\n  - ${paths}`
    );
  }

  const imageImport = matches[0];

  if (!imageImport) {
    throw new Error(
      `Image not found for: ${imageName} in the generateBlurPlaceholder method.`
    );
  }

  const filePath = imageImport[0];

  const finalWidth = height ? null : width || 16;

  try {
    const imageBuffer = await getImageBuffer(filePath);
    const image = await sharp(imageBuffer)
      .resize(finalWidth, height)
      .blur(blurSigma || BLUR_SIGMA)
      .toBuffer();

    const base64 = `data:image/png;base64,${image.toString('base64')}`;
    return base64;
  } catch (error) {
    console.error(
      `Error generating blur placeholder for the image: ${filePath}`,
      error
    );
    return null;
  }
}
