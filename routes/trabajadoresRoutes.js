const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/trabajadoresController');


router.get('/trabajadores', trabajadorController.obtenerTrabajadores);
router.get('/trabajadores/:id', trabajadorController.obtenerTrabajadorPorId);
router.post('/trabajadores', trabajadorController.crearTrabajador);
router.post('/trabajadores/iniciar_sesion', trabajadorController.iniciarSesionTrabajador);
router.delete('/trabajadores/:id', trabajadorController.eliminarTrabajador); // Ruta para eliminar un trabajador
router.post('/trabajadores/:id/cambiar_rol', trabajadorController.cambiarRol); // Ruta para cambiar el rol de un trabajador


module.exports = router;
