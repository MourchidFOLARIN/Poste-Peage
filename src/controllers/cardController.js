const prisma = require('../config/db');

/**
 * Enregistrer une nouvelle carte et la lier à un utilisateur
 * POST /api/cards/register
 * Body: { card_uid: string, user_name: string, user_email: string, user_phone?: string, initial_balance?: number }
 */
exports.registerCard = async (req, res, next) => {
  try {
    const { card_uid, user_name, user_email, user_phone, initial_balance } = req.body;

    if (!card_uid || !user_email || !user_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Les champs card_uid, user_name et user_email sont obligatoires'
      });
    }

    // Vérifier si la carte existe déjà
    const existingCard = await prisma.card.findUnique({
      where: { uid: card_uid }
    });

    if (existingCard) {
      return res.status(400).json({
        status: 'error',
        message: 'Cette carte RFID est déjà enregistrée'
      });
    }

    // Trouver ou créer l'utilisateur par son email
    let user = await prisma.user.findUnique({
      where: { email: user_email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: user_name,
          email: user_email,
          phone: user_phone || null
        }
      });
    }

    // Créer la carte
    const newCard = await prisma.card.create({
      data: {
        uid: card_uid,
        balance: initial_balance ? parseFloat(initial_balance) : 0.0,
        status: 'ACTIVE',
        userId: user.id
      },
      include: { user: true }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Carte enregistrée avec succès',
      data: newCard
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Recharger le solde d'une carte
 * POST /api/cards/recharge
 * Body: { card_uid: string, amount: number }
 */
exports.rechargeCard = async (req, res, next) => {
  try {
    const { card_uid, amount } = req.body;

    const rechargeAmount = parseFloat(amount);

    if (!card_uid || isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'card_uid valide et montant positif (amount) requis'
      });
    }

    // Vérifier l'existence de la carte
    const card = await prisma.card.findUnique({
      where: { uid: card_uid },
      include: { user: true }
    });

    if (!card) {
      return res.status(404).json({
        status: 'error',
        message: 'Carte introuvable'
      });
    }

    // Mise à jour du solde
    const updatedCard = await prisma.card.update({
      where: { id: card.id },
      data: {
        balance: { increment: rechargeAmount }
      },
      include: { user: true }
    });

    const { emitCardRecharged } = require('../config/socket');
    emitCardRecharged({
      card_uid: updatedCard.uid,
      user_name: updatedCard.user.name,
      new_balance: updatedCard.balance,
      recharge_amount: rechargeAmount
    });

    return res.json({
      status: 'success',
      message: `Solde rechargé de ${rechargeAmount} FCFA avec succès`,
      data: {
        card_uid: updatedCard.uid,
        user_name: updatedCard.user.name,
        new_balance: updatedCard.balance
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les informations et le solde d'une carte
 * GET /api/cards/:uid
 */
exports.getCardByUid = async (req, res, next) => {
  try {
    const { uid } = req.params;

    const card = await prisma.card.findUnique({
      where: { uid },
      include: { user: true }
    });

    if (!card) {
      return res.status(404).json({
        status: 'error',
        message: 'Carte introuvable'
      });
    }

    return res.json({
      status: 'success',
      data: card
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir toutes les cartes avec recherche et filtres (Admin)
 * GET /api/cards
 * Query: ?q=recherche&status=ACTIVE|BLOCKED
 */
exports.getAllCards = async (req, res, next) => {
  try {
    const { q, status } = req.query;

    const whereClause = {};

    if (status && ['ACTIVE', 'BLOCKED'].includes(status.toUpperCase())) {
      whereClause.status = status.toUpperCase();
    }

    if (q) {
      whereClause.OR = [
        { uid: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const cards = await prisma.card.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      status: 'success',
      count: cards.length,
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier le statut d'une carte (Bloquer / Débloquer)
 * PATCH /api/cards/:uid/status
 * Body: { status: 'ACTIVE' | 'BLOCKED' }
 */
exports.updateCardStatus = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Le statut doit être ACTIVE ou BLOCKED'
      });
    }

    const card = await prisma.card.findUnique({ where: { uid } });
    if (!card) {
      return res.status(404).json({
        status: 'error',
        message: 'Carte introuvable'
      });
    }

    const updatedCard = await prisma.card.update({
      where: { uid },
      data: { status },
      include: { user: true }
    });

    return res.json({
      status: 'success',
      message: `Statut de la carte mis à jour : ${status}`,
      data: updatedCard
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir la liste de tous les utilisateurs (Admin)
 * GET /api/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { cards: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir l'historique complet des transactions
 * GET /api/transactions
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const { status, card_uid, toll_gate_id } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status.toUpperCase();
    if (card_uid) whereClause.cardUid = card_uid;
    if (toll_gate_id) whereClause.tollGateId = toll_gate_id;

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { tollGate: true },
      take: 100 // Limite par défaut à 100 transactions récentes
    });

    return res.json({
      status: 'success',
      count: transactions.length,
      data: transactions
    });

  } catch (error) {
    next(error);
  }
};

