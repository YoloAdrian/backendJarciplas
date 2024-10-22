const express = require('express');
const router = express.Router();
const historialDeslindeController = require('../controllers/historialDeslindeController');

router.get('/historial_deslinde', historialDeslindeController.obtenerHistorialDeslindes);
router.post('/historial_deslinde', historialDeslindeController.crearHistorialDeslinde);

module.exports = router;
