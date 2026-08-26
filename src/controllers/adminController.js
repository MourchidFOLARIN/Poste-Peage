const prisma = require('../config/db');
const { getTollFee, setTollFee } = require('../config/settings');

/**
 * Statistiques globalisées pour le Dashboard Admin
 * GET /api/admin/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'AUTHORIZED', createdAt: { gte: today } }
    });
    const totalTodayRevenue = todayTransactions._sum.amount || 0;

    const authorizedCount = await prisma.transaction.count({ where: { status: 'AUTHORIZED' } });
    const refusedCount = await prisma.transaction.count({ where: { status: 'REFUSED' } });
    const activeCardsCount = await prisma.card.count({ where: { status: 'ACTIVE' } });
    const blockedCardsCount = await prisma.card.count({ where: { status: 'BLOCKED' } });
    const totalUsersCount = await prisma.user.count();

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
        currentTollFee: getTollFee(),
        recentScans
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Graphique des revenus sur N jours
 * GET /api/admin/revenue-chart?days=7
 */
exports.getRevenueChart = async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const results = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const agg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: {
          status: 'AUTHORIZED',
          createdAt: { gte: date, lt: nextDate }
        }
      });

      results.push({
        date: date.toISOString().slice(0, 10),
        revenue: agg._sum.amount || 0,
        count: agg._count.id || 0
      });
    }

    return res.json({ status: 'success', data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * Retourner le tarif de péage actuel
 * GET /api/admin/toll-fee
 */
exports.getTollFee = async (req, res, next) => {
  try {
    return res.json({ status: 'success', data: { tollFee: getTollFee() } });
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier le tarif de péage
 * PATCH /api/admin/toll-fee
 * Body: { amount: number }
 */
exports.updateTollFee = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ status: 'error', message: 'Le montant est requis' });
    }
    const newFee = setTollFee(amount);
    return res.json({
      status: 'success',
      message: `Tarif de péage mis à jour : ${newFee.toLocaleString('fr-FR')} FCFA`,
      data: { tollFee: newFee }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier un utilisateur (nom, email, téléphone)
 * PATCH /api/admin/users/:id
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
    }

    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ status: 'error', message: 'Cet email est déjà utilisé' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null })
      },
      include: { cards: true }
    });

    return res.json({
      status: 'success',
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un utilisateur (cascade cartes + recharges)
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Impossible de supprimer un compte administrateur' });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ status: 'success', message: `Utilisateur "${user.name}" supprimé avec succès` });
  } catch (error) {
    next(error);
  }
};

/**
 * Lister tous les postes de péage
 * GET /api/admin/tollgates
 */
exports.getTollGates = async (req, res, next) => {
  try {
    const tollGates = await prisma.tollGate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { transactions: true } }
      }
    });
    return res.json({ status: 'success', count: tollGates.length, data: tollGates });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un poste de péage
 * POST /api/admin/tollgates
 * Body: { name, location }
 */
exports.createTollGate = async (req, res, next) => {
  try {
    const { name, location } = req.body;
    if (!name || !location) {
      return res.status(400).json({ status: 'error', message: 'Le nom et la localisation sont requis' });
    }

    const tollGate = await prisma.tollGate.create({
      data: { name, location, status: 'ACTIVE' },
      include: { _count: { select: { transactions: true } } }
    });

    return res.status(201).json({
      status: 'success',
      message: `Poste "${name}" créé avec succès`,
      data: tollGate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier un poste de péage (nom, localisation, statut)
 * PATCH /api/admin/tollgates/:id
 */
exports.updateTollGate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, status } = req.body;

    const gate = await prisma.tollGate.findUnique({ where: { id } });
    if (!gate) {
      return res.status(404).json({ status: 'error', message: 'Poste de péage introuvable' });
    }

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Statut invalide (ACTIVE ou INACTIVE)' });
    }

    const updated = await prisma.tollGate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(status && { status })
      },
      include: { _count: { select: { transactions: true } } }
    });

    return res.json({ status: 'success', message: 'Poste mis à jour', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un poste de péage
 * DELETE /api/admin/tollgates/:id
 */
exports.deleteTollGate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const gate = await prisma.tollGate.findUnique({
      where: { id },
      include: { _count: { select: { transactions: true } } }
    });

    if (!gate) {
      return res.status(404).json({ status: 'error', message: 'Poste de péage introuvable' });
    }

    // Nullifier les références dans les transactions avant suppression
    await prisma.transaction.updateMany({
      where: { tollGateId: id },
      data: { tollGateId: null }
    });

    await prisma.tollGate.delete({ where: { id } });

    return res.json({ status: 'success', message: `Poste "${gate.name}" supprimé avec succès` });
  } catch (error) {
    next(error);
  }
};
