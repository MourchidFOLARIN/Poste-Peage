const prisma = require('../config/db');
const { emitScanEvent } = require('../config/socket');

const TOLL_FEE = 500.0; // Tarif du péage en FCFA

/**
 * Endpoint critique : Scan de carte RFID par l'ESP32
 * POST /api/toll/scan
 * Body: { card_uid: string, toll_gate_id?: string }
 */
exports.scanCard = async (req, res, next) => {
  try {
    const { card_uid, toll_gate_id } = req.body;

    if (!card_uid) {
      return res.status(400).json({
        status: 'error',
        message: 'UID de carte manquant'
      });
    }

    // Vérification optionnelle de l'existence du poste de péage
    let validTollGateId = null;
    if (toll_gate_id) {
      const gate = await prisma.tollGate.findUnique({ where: { id: toll_gate_id } });
      if (gate) {
        validTollGateId = gate.id;
      }
    }

    // 1. Rechercher la carte avec son utilisateur lié
    const card = await prisma.card.findUnique({
      where: { uid: card_uid },
      include: { user: true }
    });

    // Cas 1 : Carte non enregistrée
    if (!card) {
      const tx = await prisma.transaction.create({
        data: {
          cardUid: card_uid,
          amount: 0,
          status: 'REFUSED',
          reason: 'carte_inconnue',
          tollGateId: validTollGateId
        }
      });
      emitScanEvent(tx);

      return res.json({
        status: 'refused',
        message: 'Carte non enregistree'
      });
    }

    const userName = card.user ? card.user.name : 'Inconnu';

    // Cas 2 : Carte bloquée
    if (card.status !== 'ACTIVE') {
      const tx = await prisma.transaction.create({
        data: {
          cardUid: card_uid,
          userName: userName,
          amount: 0,
          status: 'REFUSED',
          reason: 'carte_bloquee',
          tollGateId: validTollGateId
        }
      });
      emitScanEvent(tx);

      return res.json({
        status: 'refused',
        message: 'Carte bloquee'
      });
    }

    // Cas 3 : Solde insuffisant
    if (card.balance < TOLL_FEE) {
      const tx = await prisma.transaction.create({
        data: {
          cardUid: card_uid,
          userName: userName,
          amount: 0,
          status: 'REFUSED',
          reason: 'solde_insuffisant',
          tollGateId: validTollGateId
        }
      });
      emitScanEvent(tx);

      return res.json({
        status: 'refused',
        message: 'Solde insuffisant'
      });
    }

    // Cas 4 : Solde suffisant -> Transaction atomique Prisma
    const [updatedCard, transaction] = await prisma.$transaction([
      prisma.card.update({
        where: { id: card.id },
        data: { balance: { decrement: TOLL_FEE } }
      }),
      prisma.transaction.create({
        data: {
          cardUid: card_uid,
          userName: userName,
          amount: TOLL_FEE,
          status: 'AUTHORIZED',
          tollGateId: validTollGateId
        }
      })
    ]);

    emitScanEvent({
      ...transaction,
      newBalance: updatedCard.balance,
      cardUid: card_uid
    });

    return res.json({
      status: 'authorized',
      user_name: userName,
      remaining_balance: updatedCard.balance,
      message: 'Passage autorise'
    });

  } catch (error) {
    next(error);
  }
};
