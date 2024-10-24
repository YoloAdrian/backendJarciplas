// routes/recuperacionRoutes.js
const express = require('express');
const { solicitarRecuperacion, verificarCodigo } = require('../controllers/recuperacionController');

const router = express.Router();

// Ruta para enviar el código de recuperación
router.post('/enviar-codigo', solicitarRecuperacion);


router.post('/verificar-codigo', verificarCodigo);

module.exports = router;



