const express = require('express');
const router = express.Router();
const historialTerminosController = require('../controllers/historialTerminosController');

router.get('/historial_terminos', historialTerminosController.obtenerHistorialTerminos);
router.post('/historial_terminos', historialTerminosController.crearHistorialTermino);

module.exports = router;
