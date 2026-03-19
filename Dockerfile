# =========================================================================================
#                                          base
# =========================================================================================
FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# =========================================================================================
#                                          deps
# =========================================================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# =========================================================================================
#                                          build
# =========================================================================================
FROM deps AS build

COPY . .
RUN pnpm build && pnpm prune --prod

# =========================================================================================
#                                          runtime
# =========================================================================================
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN mkdir -p /app/.app-data && chown -R node:node /app

COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 3000
CMD ["node", "build"]
