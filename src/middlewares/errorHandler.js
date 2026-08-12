/**
 * Middleware centralisé de gestion des erreurs Express
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.stack || err.message || err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
