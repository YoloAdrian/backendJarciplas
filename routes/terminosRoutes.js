const express = require('express');
const router = express.Router();
const terminosController = require('../controllers/terminosControllers');

// Ruta para obtener términos
router.get('/terminos', terminosController.obtenerTerminos);

// Ruta para crear un nuevo término
router.post('/terminos', terminosController.crearTerminos);

// Ruta para modificar un término por ID
router.put('/terminos/:id', terminosController.modificarTerminos);

// Ruta para marcar un término como eliminado por ID
router.delete('/terminos/:id', terminosController.marcarComoEliminado);

// Ruta para obtener el historial de versiones de un término por ID
router.get('/terminos/:id/historial', terminosController.obtenerHistorialTerminos);

// Ruta para obtener los términos vigentes
router.get('/terminos/vigente', terminosController.obtenerTerminosVigentes);

module.exports = router;
