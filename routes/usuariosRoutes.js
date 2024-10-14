const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuariosController');


router.get('/usuarios', usuarioController.obtenerUsuarios);
router.get('/usuarios/:id', usuarioController.obtenerUsuarioPorId);
router.post('/usuarios', usuarioController.crearUsuario);


module.exports = router;
