const { PrismaClient } = require('@prisma/client');

// Instance unique de Prisma Client pour gérer la connexion à PostgreSQL
const prisma = new PrismaClient();

module.exports = prisma;
