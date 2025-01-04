import fs from 'node:fs';
import path from 'node:path';

/** Get all files in a specific sub-directory of `public`
 * @example
 * // Get all files in the 'resume' sub-directory
 * const resumeFiles = getPublicFiles('resume');
 */
export function getPublicFiles(relativeDirPath: string) {
  const publicDir = path.resolve(process.cwd(), 'public');
  const dirPath = path.resolve(publicDir, relativeDirPath);

  try {
    if (!fs.existsSync(dirPath)) {
      throw new Error(
        `Directory ${relativeDirPath} does not exist in the public folder`
      );
    }
    const files = fs.readdirSync(dirPath);

    return files.reduce<Record<string, string>>((acc, file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isFile()) {
        const filePath = path.join(relativeDirPath, file);

        acc[file] = filePath;
      }
      return acc;
    }, {});
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    throw new Error(
      `Failed to read files from ${relativeDirPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/** Validates if a file exists in the `public` directory
 * @example
 * // Check if 'resume/my-cv-2025.pdf' exists in the public directory
 * const exists = validatePublicFile('resume/my-cv-2025.pdf');
 *
 */
export function validatePublicFile(relativePath: string): boolean {
  const publicDir = path.resolve(process.cwd(), 'public');
  const filePath = path.resolve(publicDir, relativePath);

  return fs.existsSync(filePath);
}
