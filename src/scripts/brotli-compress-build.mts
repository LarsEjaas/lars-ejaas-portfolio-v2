import { readdir, stat, readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliCompress, constants as zlibConstants } from 'node:zlib';
import { constants as fsConstants } from 'node:fs';

// Recursively walk through a folder and collect matching files
async function getFiles(dir: string, exts: string[], files: string[] = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await getFiles(fullPath, exts, files);
    } else if (entry.isFile() && exts.some((ext) => fullPath.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

// Check if file already has a .br version
async function isAlreadyCompressed(filePath: string) {
  try {
    await access(filePath + '.br', fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Compress one file to Brotli
async function compressFile(filePath: string): Promise<boolean> {
  if (await isAlreadyCompressed(filePath)) {
    console.info(`Skipping (already compressed): ${filePath}`);
    return false;
  }

  const fileBuffer = await readFile(filePath);

  return new Promise<boolean>((resolve, reject) => {
    brotliCompress(
      fileBuffer,
      {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 11, // Max compression
        },
      },
      async (err, result) => {
        if (err) return reject(err);
        await writeFile(filePath + '.br', result);
        resolve(true);
      }
    );
  });
}

async function main() {
  const distDir = join(process.cwd(), 'dist');

  // Find all JS, CSS, and HTML files in the dist directory
  const filesToCompress = await getFiles(distDir, ['.js', '.css', '.html']);

  console.info(
    `Found ${filesToCompress.length} JS, CSS, and HTML files to compress...`
  );
  for (const file of filesToCompress) {
    const didCompress = await compressFile(file);
    if (didCompress) {
      const originalSize = (await stat(file)).size;
      const brotliSize = (await stat(file + '.br')).size;
      console.info(
        `Compressed: ${file} → ${(brotliSize / 1024).toFixed(2)} KB (${(
          (brotliSize / originalSize) *
          100
        ).toFixed(1)}% of original)`
      );
    }
  }
  console.info('✅ Brotli compression complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// To run this script execute it with Node.js:
// node --experimental-transform-types ./src/scripts/brotli-compress-build.mts
