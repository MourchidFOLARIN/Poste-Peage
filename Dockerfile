FROM node:20-alpine

# Installer OpenSSL pour Prisma sur Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Copier les définitions de dépendances et le schéma Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installer toutes les dépendances propres et générer le client Prisma
RUN npm ci
RUN npx prisma generate

# Copier le reste du code backend
COPY . .

# Définir l'environnement de production
ENV NODE_ENV=production

# Exposer le port de l'application (5000 par défaut)
EXPOSE 5000

# Démarrer le serveur API Express
CMD ["npm", "start"]
