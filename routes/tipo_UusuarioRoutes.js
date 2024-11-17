const express = require('express');
const { obtenerTiposUsuarios } = require('../controllers/tipo_UsuariosController');
const router = express.Router();

router.get('/tipos_usuarios', obtenerTiposUsuarios); 

module.exports = router;
