const express = require('express');
const { obtenerTiposUsuarios } = require('../controllers/tipo_UsuariosController');
const router = express.Router();

router.get('/tipos_usuarios', obtenerTiposUsuarios); // Cambiado a "tipos-usuarios"

module.exports = router;
