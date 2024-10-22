const express = require('express');
const router = express.Router();
const politicaController = require('../controllers/politicasController');

// Ruta para obtener políticas (documentos regulatorios)
router.get('/politicas', politicaController.obtenerPoliticas);

// Ruta para crear un nuevo Documento Regulatorio
router.post('/politicas', politicaController.crearPolitica);

// Ruta para modificar un Documento Regulatorio por ID
router.put('/politicas/:id', politicaController.modificarPolitica);

// Ruta para marcar un Documento Regulatorio como eliminado por ID
router.delete('/politicas/:id', politicaController.marcarComoEliminada);

// Ruta para obtener el historial de versiones de un Documento Regulatorio por ID
router.get('/politicas/:id/historial', politicaController.obtenerHistorialPoliticas);

module.exports = router;
