// routes/recuperacionRoutes.js
const express = require('express');
const { solicitarRecuperacion, verificarCodigo ,   solicitarRecuperacionContrasena, cambiarContrasena } = require('../controllers/recuperacionController');

const router = express.Router();

// Ruta para enviar el código de recuperación
router.post('/enviar-codigo', solicitarRecuperacion);


router.post('/verificar-codigo', verificarCodigo);

router.post('/solicitar-recuperacion-contrasena', solicitarRecuperacionContrasena);

// Ruta para cambiar la contraseña utilizando el token
router.post('/cambiar-contrasena', cambiarContrasena);
module.exports = router;



