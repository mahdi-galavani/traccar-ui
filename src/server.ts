import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

const backendUrl = process.env['BACKEND_URL'] || 'http://45.94.215.237:8001';

console.log(`Proxying /api requests to: ${backendUrl}`);

// پروکسی اصلاح‌شده برای v4
app.use(
  '/api',
  createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true,
    secure: false,
    ws: true,

    on: {
      proxyReq: (proxyReq, req) => {
        // حذف هدرهای مشکل‌ساز (دلیل اصلی 403)
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
        proxyReq.removeHeader('x-forwarded-for');
        proxyReq.removeHeader('x-forwarded-host');
        proxyReq.removeHeader('x-forwarded-proto');

        // تنظیم هاست دقیق
        const targetHost = backendUrl.replace(/^https?:\/\//, '').split(':')[0];
        proxyReq.setHeader('host', targetHost);
      },

      proxyRes: (proxyRes) => {
        // کمک به CORS
        proxyRes.headers['access-control-allow-origin'] = '*';
      }
    }
  })
);

// Serve static files
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

// Angular SSR Handler
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`🔗 Backend URL: ${backendUrl}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
