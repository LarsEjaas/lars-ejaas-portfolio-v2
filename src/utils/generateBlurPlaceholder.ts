import sharp from 'sharp';
import fs from 'fs';
import { removeLeadingSlash } from '@i18n/utils';

async function getImageBuffer(imagePath: string) {
  const buffer = await fs.promises.readFile(removeLeadingSlash(imagePath));
  return buffer;
}

const images = import.meta.glob('/src/assets/**/*.{jpg,png}');

const BLUR_SIGMA = 1.2;

/** Generates a base64 blur placeholder for the supplied image. */
export async function generateBlurPlaceholder(
  imagePath: string,
  width?: number
): Promise<string | null> {
  const imageName = imagePath.split('?')[0]?.split('/').pop();
  if (!imageName) {
    throw new Error(`no imageName found for: ${imagePath.split('?')[0]}`);
  }

  const imageImport = Object.entries(images).find(([filePath]) =>
    filePath.includes(imageName)
  );

  if (!imageImport) {
    throw new Error(
      `Image not found for: ${imageName} in the generateBlurPlaceholder method.`
    );
  }

  const filePath = imageImport[0];

  try {
    const imageBuffer = await getImageBuffer(filePath);
    const image = await sharp(imageBuffer)
      .resize(width || 16)
      .blur(BLUR_SIGMA)
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
