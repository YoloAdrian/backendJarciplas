const express = require('express');
const router = express.Router();
const deslindeLegalController = require('../controllers/deslindeController');

router.get('/deslinde_legal', deslindeLegalController.obtenerDeslindesLegales);
router.post('/deslinde_legal', deslindeLegalController.crearDeslindeLegal);

module.exports = router;
