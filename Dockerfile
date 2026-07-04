FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=true

RUN npm run build

# مرحله نهایی
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev --ignore-scripts

EXPOSE 4000
CMD ["npm", "run", "serve:ssr:airport-management-ui"]
