import sharp from 'sharp';
import { getLocalImagePath } from './getLocalImagePath';

const BLUR_SIGMA = 1.2;

/** Generates a base64 blur placeholder for the supplied image. */
export async function generateBlurPlaceholder(
  imagePath: string,
  width?: number
): Promise<string | null> {
  try {
    const path = getLocalImagePath(imagePath);
    const image = await sharp(path)
      .resize(width || 16)
      .blur(BLUR_SIGMA)
      .toBuffer();

    const base64 = `data:image/png;base64,${image.toString('base64')}`;
    return base64;
  } catch (error) {
    console.error(
      `Error generating blur placeholder for the image: ${imagePath}`,
      error
    );
    return null;
  }
}
