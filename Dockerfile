FROM node:22-alpine AS base
RUN npm install -g pnpm
RUN apk update && apk add zsh vim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --save-dev @swc/cli @swc/core
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY . .
RUN pnpm run build

FROM build AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
RUN pnpm store prune
RUN pnpm prune --prod
RUN chown -R appuser:appgroup /app
USER appuser
CMD ["pnpm", "start:prod"]

FROM base AS development

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
ENV NODE_ENV=development
RUN pnpm install
COPY . .
RUN chown -R appuser:appgroup /app
USER appuser
CMD ["pnpm", "start:dev"]
