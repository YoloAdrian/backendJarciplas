const express = require('express');
const { obtenerConfiguracion, actualizarConfiguracion, obtenerCantidadErrores } = require('../controllers/configuracionController');
const router = express.Router();

// Ruta para obtener la configuración por ID
router.get('/configuracion/:id', obtenerConfiguracion);

// Ruta para actualizar la configuración
router.put('/configuracion/:id', actualizarConfiguracion);
router.get('/configuracion/cantidad_errores/:id', obtenerCantidadErrores);

module.exports = router;
