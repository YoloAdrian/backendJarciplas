const express = require('express');
const router = express.Router();
const historialPoliticaController = require('../controllers/historialPoliticasController');

router.get('/historial_politicas', historialPoliticaController.obtenerHistorialPoliticas);
router.post('/historial_politicas', historialPoliticaController.crearHistorialPolitica);

module.exports = router;
