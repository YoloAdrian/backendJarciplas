const express = require('express');
const router = express.Router();
const { generarMFAQR, verificarTokenMFA } = require('../controllers/mfaController');

// Ruta para generar el código QR
router.post('/mfa/generar/:tipo/:id', generarMFAQR);

// Ruta para verificar el token MFA
router.post('/mfa/verificar/:tipo/:id', verificarTokenMFA);

module.exports = router;
