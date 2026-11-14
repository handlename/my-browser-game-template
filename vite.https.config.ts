import fs from 'node:fs';
import { defineConfig } from 'vite';
import pkg from './package.json';

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    host: true,
    port: 5174,
    https:
      fs.existsSync('certs/key.pem') && fs.existsSync('certs/cert.pem')
        ? {
            key: fs.readFileSync('certs/key.pem'),
            cert: fs.readFileSync('certs/cert.pem'),
          }
        : undefined,
    // Forces Vite to use node:https (HTTP/1.1) instead of node:http2 under Bun for iOS Safari
    proxy: {},
  },
});
