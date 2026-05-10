FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# This image is only a build artifact for gbandit: put the static frontend
# bundle in /out, and the platform will publish and serve it via shared nginx.
FROM scratch
COPY --from=build /app/dist /out
