require('dotenv').config();

const app = require('./app');
const prisma = require('./config/db');
const { initSocket } = require('./config/socket');

const { exec } = require('child_process');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Péage ESP32 (PostgreSQL/Prisma) démarré sur http://0.0.0.0:${PORT}`);

  // Synchronisation automatique de la BDD (Création de la table recharges) sans bloquer Render
  exec('npx prisma db push --accept-data-loss', (error, stdout, stderr) => {
    if (error) {
      console.warn('⚠️ Synchro BDD (Prisma push warning) :', error.message);
    } else {
      console.log('✅ Schéma PostgreSQL synchronisé avec succès (table recharges active) !');
    }
  });
});

// Initialiser le serveur WebSockets Socket.io
initSocket(server);

// Fermeture propre du serveur et du client Prisma
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ Signal ${signal} reçu. Fermeture du serveur...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Déconnexion de la base de données PostgreSQL terminée.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
