FROM node:20-alpine

# Installer OpenSSL pour Prisma sur Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 1 : Installer les dépendances BACKEND et générer Prisma
# ─────────────────────────────────────────────────────────────────
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 2 : Installer les dépendances FRONTEND et builder React
# ─────────────────────────────────────────────────────────────────
COPY frontend/package*.json ./frontend/

RUN npm ci --prefix frontend --include=dev

COPY frontend ./frontend/

RUN npm run build --prefix frontend

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 3 : Copier le reste du backend
# ─────────────────────────────────────────────────────────────────
COPY src ./src/

# Définir l'environnement de production
ENV NODE_ENV=production

# Exposer le port de l'application (5000 par défaut)
EXPOSE 5000

# Démarrer le serveur API Express (sert aussi le frontend dist/)
CMD ["npm", "start"]
