const express = require('express');
const router = express.Router();
const tollController = require('../controllers/tollController');

// Route appelée par l'ESP32 lors du scan RFID
router.post('/scan', tollController.scanCard);

module.exports = router;
