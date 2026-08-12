const prisma = require('../config/db');

/**
 * Obtenir les statistiques globalisées pour le Dashboard Admin
 * GET /api/admin/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Recette du jour (FCFA)
    const todayTransactions = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        status: 'AUTHORIZED',
        createdAt: { gte: today }
      }
    });
    const totalTodayRevenue = todayTransactions._sum.amount || 0;

    // 2. Nombre total de transactions (Autorisées vs Refusées)
    const authorizedCount = await prisma.transaction.count({ where: { status: 'AUTHORIZED' } });
    const refusedCount = await prisma.transaction.count({ where: { status: 'REFUSED' } });

    // 3. Cartes Actives vs Bloquées
    const activeCardsCount = await prisma.card.count({ where: { status: 'ACTIVE' } });
    const blockedCardsCount = await prisma.card.count({ where: { status: 'BLOCKED' } });

    // 4. Nombre d'utilisateurs
    const totalUsersCount = await prisma.user.count();

    // 5. Flux des 10 dernières transactions en direct
    const recentScans = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { tollGate: true }
    });

    return res.json({
      status: 'success',
      data: {
        totalTodayRevenue,
        authorizedCount,
        refusedCount,
        activeCardsCount,
        blockedCardsCount,
        totalUsersCount,
        recentScans
      }
    });

  } catch (error) {
    next(error);
  }
};
