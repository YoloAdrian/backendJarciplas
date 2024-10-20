const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuariosController');

router.get('/usuarios', usuarioController.obtenerUsuarios);
router.get('/usuarios/:id_usuarios', usuarioController.obtenerUsuarioPorId); // Cambiar a id_usuarios
router.post('/usuarios', usuarioController.crearUsuario);
router.post('/usuarios/iniciar_sesion', usuarioController.iniciarSesionUsuario);
router.post('/usuarios/:id_usuarios/cambiar_rol', usuarioController.cambiarRolUsuario); // Cambiar a id_usuarios
router.delete('/usuarios/:id_usuarios', usuarioController.eliminarUsuario); // Añadir ruta para eliminar usuario
router.post('/usuarios/:id_usuarios/generar_mfa', usuarioController.generarMFAQR); // Ruta para generar MFA
router.post('/usuarios/:id_usuarios/verificar_mfa', usuarioController.verificarTokenMFA); // Ruta para verificar MFA

module.exports = router;
