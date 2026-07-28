FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
# npm's own download cache (~200 MB) is bigger than node_modules itself and is
# useless once the install layer is cached, so it never gets to enter the layer.
RUN npm install --no-audit --no-fund && npm cache clean --force

COPY . .
RUN npm run build

# This image is only a build artifact for gbandit: put the static frontend
# bundle in /out, and the platform will publish and serve it via shared nginx.
FROM scratch
COPY --from=build /app/dist /out
