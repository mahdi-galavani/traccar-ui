# ==========================================
# مرحله ۱: نصب وابستگی‌ها و بیلد پروژه
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# کپی فایل‌های پکیج برای استفاده از سیستم کش داکر
COPY package*.json ./
RUN npm ci

# کپی کل پروژه و اجرای بیلد
COPY . .
RUN npm run build

# ==========================================
# مرحله ۲: اجرای اپلیکیشن در محیط پروداکشن سبک
# ==========================================
FROM node:20-alpine
WORKDIR /app

# کپی کردن پوشه خروجی بیلد از مرحله قبل
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./

# نصب فقط وابستگی‌های ضروری پروداکشن برای سبک نگه داشتن ایمیج
RUN npm filter-production-only || npm ci --omit=dev

EXPOSE 4000

# اجرای اسکریپت سرور SSR انگولار
CMD ["npm", "run", "serve:ssr:airport-management-ui"]
