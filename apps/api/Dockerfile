# ==========================================
# ÉTAPE 1 — BUILD
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Outils nécessaires pour les dépendances natives
RUN apk add --no-cache python3 make g++

# Copier les fichiers package.json du monorepo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

# Installer toutes les dépendances
RUN npm ci

# Copier le package partagé
COPY packages/shared packages/shared

# Copier l'API
COPY apps/api apps/api

# Construire le package partagé
RUN npm run build --workspace @afrilinkpay/shared

# Construire l'API NestJS
RUN npm run build --workspace @afrilinkpay/api


# ==========================================
# ÉTAPE 2 — PRODUCTION
# ==========================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Outils nécessaires pour les modules natifs
RUN apk add --no-cache python3 make g++

# Copier les fichiers nécessaires à npm
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier le package partagé compilé
COPY --from=builder /app/packages/shared/dist packages/shared/dist

# Copier l'API compilée
COPY --from=builder /app/apps/api/dist apps/api/dist

# Dossier pour les uploads KYC
RUN mkdir -p apps/api/uploads

EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]