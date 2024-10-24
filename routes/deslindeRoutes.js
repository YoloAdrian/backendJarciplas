const express = require('express');
const router = express.Router();
const deslindeLegalController = require('../controllers/deslindeController');

// Ruta para obtener todos los deslindes legales
router.get('/deslinde_legal', deslindeLegalController.obtenerDeslindesLegales);

// Ruta para crear un nuevo deslinde legal
router.post('/deslinde_legal', deslindeLegalController.crearDeslindeLegal);

// Ruta para modificar un deslinde legal por ID
router.put('/deslinde_legal/:id', deslindeLegalController.modificarDeslindeLegal);

// Ruta para marcar un deslinde legal como eliminado por ID
router.delete('/deslinde_legal/:id', deslindeLegalController.marcarComoEliminado);

// Ruta para obtener el historial de versiones de un deslinde legal por ID
router.get('/deslinde_legal/:id/historial', deslindeLegalController.obtenerHistorialDeslindes);

// Ruta para obtener el deslinde legal vigente
router.get('/deslinde_legal/vigente', deslindeLegalController.obtenerDeslindeVigente);


module.exports = router;
