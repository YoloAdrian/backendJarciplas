const express = require('express');
const router = express.Router();
const frecuenciaBloqueoController = require('../controllers/FrecuenciaBloqueosUsuariosControllers');

// Ruta para obtener todas las frecuencias de bloqueos
router.get('/frecuencia_bloqueos_usuarios', frecuenciaBloqueoController.obtenerFrecuenciaBloqueos);

// Ruta para crear una nueva frecuencia de bloqueo
router.post('/frecuencia_bloqueos_usuarios', frecuenciaBloqueoController.crearFrecuenciaBloqueo);

// Ruta para obtener bloqueos por ID de usuario
router.get('/frecuencia_bloqueos_usuarios/:id_usuario', frecuenciaBloqueoController.obtenerBloqueosPorUsuario);

module.exports = router;
