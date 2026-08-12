const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const tollRoutes = require('./routes/tollRoutes');
const cardRoutes = require('./routes/cardRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cardController = require('./controllers/cardController');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Sécurité avec Helmet
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors());

// Limiteur de taux de requêtes (Anti-DDoS / Brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limite chaque IP à 200 requêtes par fenêtre
  message: { status: 'error', message: 'Trop de requêtes, veuillez réessayer plus tard.' }
});
app.use(limiter);

// Parsing du JSON
app.use(express.json());

// Route Healthcheck / Test API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Péage ESP32 & PostgreSQL opérationnelle !'
  });
});

// Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/toll', tollRoutes);
app.use('/api/cards', cardRoutes);
app.get('/api/transactions', cardController.getTransactions);

// Middleware d'erreur global
app.use(errorHandler);

// Servir le Frontend React (Fichiers statiques)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Gérer les routes React (SPA) - Compatible Express 5
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

module.exports = app;
