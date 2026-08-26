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
    const { card_uid, amount, operator = 'MTN', phoneNumber } = req.body;

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

    const validOperator = ['MTN', 'MOOV', 'CELTIS'].includes(operator?.toUpperCase())
      ? operator.toUpperCase()
      : 'MTN';

    const phoneToUse = phoneNumber || card.user.phone || 'Non renseigné';

    // 1. Transaction atomique : Mise à jour du solde + Enregistrement Recharge
    const [updatedCard, rechargeRecord] = await prisma.$transaction([
      prisma.card.update({
        where: { id: card.id },
        data: {
          balance: { increment: rechargeAmount }
        },
        include: { user: true }
      }),
      prisma.recharge.create({
        data: {
          cardId: card.id,
          userId: card.userId,
          amount: rechargeAmount,
          operator: validOperator,
          phoneNumber: phoneToUse,
          status: 'SUCCESS',
          newBalance: card.balance + rechargeAmount
        }
      })
    ]);

    // 2. Émission WebSocket temps réel
    const { emitCardRecharged } = require('../config/socket');
    emitCardRecharged({
      card_uid: updatedCard.uid,
      user_name: updatedCard.user.name,
      new_balance: updatedCard.balance,
      recharge_amount: rechargeAmount,
      operator: validOperator,
      phone_number: phoneToUse,
      recharge_id: rechargeRecord.id,
      created_at: rechargeRecord.createdAt
    });

    return res.json({
      status: 'success',
      message: `Solde rechargé de ${rechargeAmount.toLocaleString('fr-FR')} FCFA avec succès via ${validOperator} !`,
      data: {
        card_uid: updatedCard.uid,
        user_name: updatedCard.user.name,
        new_balance: updatedCard.balance,
        recharge_amount: rechargeAmount,
        operator: validOperator,
        phone_number: phoneToUse,
        recharge_id: rechargeRecord.id
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
 * Supprimer une carte RFID (cascade recharges)
 * DELETE /api/cards/:uid
 */
exports.deleteCard = async (req, res, next) => {
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

    await prisma.card.delete({ where: { uid } });

    return res.json({
      status: 'success',
      message: `Carte ${uid} supprimée avec succès`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir la liste de tous les utilisateurs (Admin)
 * GET /api/admin/users
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
      take: 100
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

/**
 * Obtenir l'historique de toutes les recharges Mobile Money (Admin)
 * GET /api/admin/recharges
 */
exports.getAllRecharges = async (req, res, next) => {
  try {
    const recharges = await prisma.recharge.findMany({
      include: {
        card: true,
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return res.json({
      status: 'success',
      count: recharges.length,
      data: recharges
    });
  } catch (error) {
    next(error);
  }
};
