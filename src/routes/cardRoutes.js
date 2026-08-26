const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// Routes de gestion des cartes
router.get('/', cardController.getAllCards);
router.post('/register', cardController.registerCard);
router.post('/recharge', cardController.rechargeCard);
router.patch('/:uid/status', cardController.updateCardStatus);
router.delete('/:uid', cardController.deleteCard);
router.get('/:uid', cardController.getCardByUid);

module.exports = router;
