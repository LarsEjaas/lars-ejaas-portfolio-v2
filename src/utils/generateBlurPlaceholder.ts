import sharp from 'sharp';
import fs from 'fs';
import { removeLeadingSlash } from '@i18n/utils';

async function getImageBuffer(imagePath: string) {
  while (true) {
    try {
      await fs.promises.access(removeLeadingSlash(imagePath));
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  const buffer = await fs.promises.readFile(removeLeadingSlash(imagePath));
  return buffer;
}

const images = import.meta.glob('/src/assets/**/*.{jpg,jpeg,png,svg}');

const BLUR_SIGMA = 2;

export function generateBlurPlaceholder(
  imagePath: string,
  width?: number,
  height?: never,
  blurSigma?: number
): Promise<string | null>;

export function generateBlurPlaceholder(
  imagePath: string,
  width: null,
  height: number,
  blurSigma?: number
): Promise<string | null>;

/** Generates a base64 blur placeholder for the supplied image. */
export async function generateBlurPlaceholder(
  imagePath: string,
  width?: number | null,
  height?: number | null,
  blurSigma?: number
): Promise<string | null> {
  //get the filename without extension
  const imageName = imagePath.split('?')[0]?.split('/').pop()?.split('.')[0];

  if (!imageName) {
    throw new Error(`no imageName found for: ${imagePath.split('?')[0]}`);
  }

  const imageImport = Object.entries(images).find(
    ([filePath]) =>
      filePath.split('/').at(-1)?.split('.').slice(0, -1)[0] === imageName
  );

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
