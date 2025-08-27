import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';

const PORT = 5432;
const ROOT = './dist';

// Minimal MIME type map
const mimeMap: Record<string, string> = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=UTF-8',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    const urlPath = req.url === '/' ? '/index.html' : req.url;
    let filePath = urlPath ? join(ROOT, decodeURIComponent(urlPath)) : '';

    // Directory fallback -> index.html
    if (existsSync(filePath) && (await stat(filePath)).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Not found');
      return;
    }

    const ext = extname(filePath).toLowerCase();
    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');

    // Brotli check
    const brotliPath = filePath + '.br';
    const clientAcceptsBrotli = /\bbr\b/.test(
      req.headers['accept-encoding'] || ''
    );
    if (clientAcceptsBrotli && existsSync(brotliPath)) {
      res.setHeader('Content-Encoding', 'br');

      if (ext === '.js') {
        const size = (await stat(brotliPath)).size;
        console.info(`✅ [Brotli] Served ${brotliPath} | Size: ${size} bytes`);
      }

      createReadStream(brotliPath).pipe(res);
      return; // Prevent further writes
    }

    // No Brotli → normal file
    const data = await readFile(filePath);
    res.end(data);

    if (ext === '.js') {
      const rawSize = (await stat(filePath)).size;
      console.info(
        `💡 [JavaScript] Served uncompressed: ${urlPath} | Size: ${rawSize} bytes`
      );
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
    }
    res.end('Server error');
  }
}).listen(PORT, () => {
  console.info(
    `🚀 Serving ${ROOT} with Brotli support on http://localhost:${PORT}`
  );
});
