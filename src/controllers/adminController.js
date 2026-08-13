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

/**
 * Auto-Seeding : Peuple la BDD si elle est vide
 */
exports.autoSeedIfEmpty = async () => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) return;

    console.log('🌱 Base de données vide détectée. Initialisation automatique...');

    const tollGate = await prisma.tollGate.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Poste de Péage d\'Ekpé (Cotonou)',
        location: 'Route Cotonou - Sèmè Kpodji',
        status: 'ACTIVE'
      }
    });

    const user = await prisma.user.create({
      data: {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '+22997000000',
        role: 'USER'
      }
    });

    await prisma.user.create({
      data: {
        name: 'Gestionnaire Admin',
        email: 'admin@peage.bj',
        phone: '+22990000000',
        role: 'ADMIN'
      }
    });

    const card = await prisma.card.create({
      data: {
        uid: 'A1B2C3D4',
        balance: 15000.0,
        status: 'ACTIVE',
        userId: user.id
      }
    });

    await prisma.transaction.createMany({
      data: [
        { cardUid: card.uid, userName: user.name, amount: 500.0, status: 'AUTHORIZED', tollGateId: tollGate.id },
        { cardUid: card.uid, userName: user.name, amount: 500.0, status: 'AUTHORIZED', tollGateId: tollGate.id },
        { cardUid: 'CARD_OFFLINE_01', userName: 'Inconnu', amount: 500.0, status: 'REFUSED', reason: 'Badge RFID non reconnu' }
      ]
    });

    console.log('✅ Base de données initialisée automatiquement avec succès !');
  } catch (err) {
    console.error('⚠️ Auto-seeding error :', err.message);
  }
};

/**
 * Endpoint manuel pour initialiser les données démo
 * POST /api/admin/seed
 */
exports.seedDatabase = async (req, res, next) => {
  try {
    await exports.autoSeedIfEmpty();
    return res.json({
      status: 'success',
      message: 'Données de démonstration réinitialisées avec succès !'
    });
  } catch (error) {
    next(error);
  }
};

