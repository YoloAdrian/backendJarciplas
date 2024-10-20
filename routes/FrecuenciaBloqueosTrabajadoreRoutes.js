const express = require('express');
const router = express.Router();
const frecuenciaBloqueoTrabajadoresController = require('../controllers/FrecuenciaBloqueosTrabajadoreControllers');


router.get('/frecuencia_bloqueos_trabajadores', frecuenciaBloqueoTrabajadoresController.obtenerFrecuenciaBloqueosTrabajadores);

router.post('/frecuencia_bloqueos_trabajadores', frecuenciaBloqueoTrabajadoresController.crearFrecuenciaBloqueoTrabajadores);

router.get('/frecuencia_bloqueos_trabajadores/:id_trabajadores', frecuenciaBloqueoTrabajadoresController.obtenerBloqueosPorTrabajador);

module.exports = router;
