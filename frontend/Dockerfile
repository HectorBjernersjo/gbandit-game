FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build
RUN find /app/dist -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.json' -o -name '*.svg' \) -exec gzip -k -9 {} \;

FROM nginx:alpine

ENV NGINX_ENTRYPOINT_WORKER_PROCESSES_AUTOTUNE=0

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
