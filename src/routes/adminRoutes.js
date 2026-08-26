const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const cardController = require('../controllers/cardController');

// Dashboard & Stats
router.get('/stats', adminController.getStats);
router.get('/revenue-chart', adminController.getRevenueChart);

// Gestion des utilisateurs
router.get('/users', cardController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Recharges Mobile Money
router.get('/recharges', cardController.getAllRecharges);

// Configuration du tarif de péage
router.get('/toll-fee', adminController.getTollFee);
router.patch('/toll-fee', adminController.updateTollFee);

// Gestion des postes de péage (CRUD)
router.get('/tollgates', adminController.getTollGates);
router.post('/tollgates', adminController.createTollGate);
router.patch('/tollgates/:id', adminController.updateTollGate);
router.delete('/tollgates/:id', adminController.deleteTollGate);

module.exports = router;
