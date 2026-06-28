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

const backendUrl = process.env['BACKEND_URL'] || 'http://127.0.0.1:8001';
const port = process.env['PORT'] || 4000;

console.log(`Proxying /api requests to: ${backendUrl}`);

// پروکسی /api — باید قبل از همه‌چیز تعریف شود
app.use(
  '/api',
  createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true, // هدر Host را به طور خودکار به آدرس کانتینر مقصد (backendUrl) تغییر می‌دهد
    secure: false,
    ws: true,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // 🟢 اصلاح کانتینر داکر: حذف دستکاری‌های دستی هدر host و پاک نکردن هدرهای x-forwarded
        // این کار به Spring Security اجازه می‌دهد تا هویت و مبدأ درخواست را به درستی تشخیص دهد
      },
    },
  }),
);

// Static files
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Angular SSR Handler
// برای صفحاتی که RenderMode.Server دارند (مثل auth/login)،
// Angular باید بداند سرور روی کجا است تا HTTP call های داخلی درست resolve شوند
app.use((req, res, next) => {
  angularApp
    .handle(req, {
      // این به Angular می‌گوید که اگر در SSR نیاز به HTTP call داشت،
      // از همین سرور express استفاده کند (از طریق پروکسی که بالا تعریف شده)
      server: `http://localhost:${port}`,
    })
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`🔗 Backend URL: ${backendUrl}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
