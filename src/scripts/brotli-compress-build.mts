import { readdir, stat, readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliCompress, constants as zlibConstants } from 'node:zlib';
import { constants as fsConstants } from 'node:fs';

// Recursively walk through a folder and collect matching files
async function getFiles(dir: string, ext: string, files: string[] = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await getFiles(fullPath, ext, files);
    } else if (entry.isFile() && fullPath.endsWith(ext)) {
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
async function compressFile(filePath: string) {
  if (await isAlreadyCompressed(filePath)) {
    console.log(`Skipping (already compressed): ${filePath}`);
    return;
  }

  const fileBuffer = await readFile(filePath);

  return new Promise<void>((resolve, reject) => {
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
        resolve();
      }
    );
  });
}

async function main() {
  const astroDir = join(process.cwd(), 'dist/_astro');

  // Find all JS files in dist/_astro
  const jsFiles = await getFiles(astroDir, '.js');

  console.log(`Found ${jsFiles.length} JS files to compress...`);
  for (const file of jsFiles) {
    await compressFile(file);
    if (!(await isAlreadyCompressed(file))) {
      const originalSize = (await stat(file)).size;
      const brotliSize = (await stat(file + '.br')).size;
      console.log(
        `Compressed: ${file} → ${(brotliSize / 1024).toFixed(2)} KB (${(
          (brotliSize / originalSize) *
          100
        ).toFixed(1)}% of original)`
      );
    }
  }
  console.log('✅ Brotli compression complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
