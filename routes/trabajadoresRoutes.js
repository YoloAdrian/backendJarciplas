const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/trabajadoresController');


router.get('/trabajadores', trabajadorController.obtenerTrabajadores);
router.get('/trabajadores/:id', trabajadorController.obtenerTrabajadorPorId);
router.post('/trabajadores', trabajadorController.crearTrabajador);
router.post('/trabajadores/iniciar_sesion', trabajadorController.iniciarSesionTrabajador);

module.exports = router;
