require('dotenv').config();

const { execSync } = require('child_process');
const app = require('./app');
const prisma = require('./config/db');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

async function initializeDatabase() {
  console.log('🔄 Synchronisation du schéma PostgreSQL...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Schéma PostgreSQL synchronisé');

  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log('🌱 Base vide — création des comptes de test...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log('✅ Données initiales créées (admin@peage.bj / jean.dupont@example.com)');
  }
}

async function startServer() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Impossible d\'initialiser la base de données :', error.message);
    process.exit(1);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Péage ESP32 démarré sur http://0.0.0.0:${PORT}`);
  });

  initSocket(server);

  const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️ Signal ${signal} reçu. Fermeture du serveur...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Déconnexion PostgreSQL terminée.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

startServer();
