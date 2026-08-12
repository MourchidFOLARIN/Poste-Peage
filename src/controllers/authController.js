const prisma = require('../config/db');

/**
 * Connexion client ou admin par email ou téléphone
 * POST /api/auth/login
 * Body: { email: string, role?: 'USER' | 'ADMIN' }
 */
exports.login = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'L\'email est obligatoire pour la connexion'
      });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        cards: true
      }
    });

    // Auto-créer le compte admin par défaut si admin@peage.bj se connecte
    if (!user && (email === 'admin@peage.bj' || email.startsWith('admin'))) {
      user = await prisma.user.create({
        data: {
          name: 'Administrateur Péage',
          email: email,
          phone: '+22990000000',
          role: 'ADMIN'
        },
        include: {
          cards: true
        }
      });
    }

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Compte introuvable avec cet email. Essayez jean.dupont@example.com ou admin@peage.bj'
      });
    }

    // Récupérer les dernières transactions liées à ses cartes
    const cardUids = user.cards.map(c => c.uid);
    const transactions = await prisma.transaction.findMany({
      where: { cardUid: { in: cardUids } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return res.json({
      status: 'success',
      token: 'jwt-token-demo-' + user.id,
      data: {
        user,
        cards: user.cards,
        transactions
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Inscription d'un nouvel automobiliste
 * POST /api/auth/register
 * Body: { name, email, phone, card_uid? }
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, card_uid } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Le nom et l\'email sont obligatoires'
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Cet email est déjà utilisé'
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null
      }
    });

    // Générer un UID de carte par défaut si non spécifié
    const uid = card_uid || 'CARD-' + Math.floor(100000 + Math.random() * 900000);
    const card = await prisma.card.create({
      data: {
        uid,
        balance: 2000.0, // Solde de bienvenue
        status: 'ACTIVE',
        userId: user.id
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Compte créé avec succès',
      token: 'jwt-token-demo-' + user.id,
      data: {
        user,
        card
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Profil de l'utilisateur actuellement connecté
 * GET /api/auth/me
 * Query: ?email=...
 */
exports.getMe = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email manquant' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { cards: true }
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });
    }

    const cardUids = user.cards.map(c => c.uid);
    const transactions = await prisma.transaction.findMany({
      where: { cardUid: { in: cardUids } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.json({
      status: 'success',
      data: {
        user,
        cards: user.cards,
        transactions
      }
    });

  } catch (error) {
    next(error);
  }
};
