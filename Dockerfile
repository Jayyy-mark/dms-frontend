# ==================================================
#   STAGE 1: BASE
# ==================================================

FROM node:22-alpine AS base

WORKDIR /app

# ==================================================
#   STAGE 2: INSTALL DEPENDENCIES
# ==================================================

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci

# ==================================================
#   STAGE 3: BUILD THE APPLICATION
# ==================================================
FROM deps AS build

COPY . .

RUN npm run build

# ==================================================
#   STAGE 4: ARTIFACTS (just the built files)
# ==================================================
FROM scratch AS artifacts

# Vite outputs to /app/dist; for Create React App use /app/build
COPY --from=build /app/dist /