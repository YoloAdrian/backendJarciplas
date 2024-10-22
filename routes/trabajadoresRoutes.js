const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/trabajadoresController');
const verificarSesion = require('../controllers/middleware');

router.get('/trabajadores', trabajadorController.obtenerTrabajadores);
router.get('/trabajadores/:id',  trabajadorController.obtenerTrabajadorPorId);
router.post('/trabajadores', trabajadorController.crearTrabajador);
router.post('/trabajadores/iniciar_sesion',  trabajadorController.iniciarSesionTrabajador);
router.delete('/trabajadores/:id',  trabajadorController.eliminarTrabajador);
router.post('/trabajadores/:id/cambiar_rol',  trabajadorController.cambiarRol);

// Nuevas rutas para MFA
router.post('/trabajadores/:id_trabajador/generar_mfa',  trabajadorController.generarMFAQR);
router.post('/trabajadores/:id_trabajador/verificar_mfa', trabajadorController.verificarTokenMFA);

module.exports = router;
