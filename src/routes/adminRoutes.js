const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const cardController = require('../controllers/cardController');

// Router d'administration
router.get('/stats', adminController.getStats);
router.get('/users', cardController.getAllUsers);

module.exports = router;
