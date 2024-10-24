const express = require('express');
const router = express.Router();
const frecuenciaBloqueoTrabajadoresController = require('../controllers/FrecuenciaBloqueosTrabajadoreControllers');


router.get('/frecuencia_bloqueos_trabajadores', frecuenciaBloqueoTrabajadoresController.obtenerFrecuenciaBloqueosTrabajadores);

router.post('/frecuencia_bloqueos_trabajadores', frecuenciaBloqueoTrabajadoresController.crearFrecuenciaBloqueoTrabajadores);

router.get('/frecuencia_bloqueos_trabajadores/:id_trabajadores', frecuenciaBloqueoTrabajadoresController.obtenerBloqueosPorTrabajador);
router.get('/frecuencia_bloqueos_trabajadores/ultimo_dia', frecuenciaBloqueoTrabajadoresController.obtenerBloqueosTrabajadoresUltimoDia);
router.get('/frecuencia_bloqueos_trabajadores/ultima_semana', frecuenciaBloqueoTrabajadoresController.obtenerBloqueosTrabajadoresUltimaSemana);
router.get('/frecuencia_bloqueos_trabajadores/ultimo_mes', frecuenciaBloqueoTrabajadoresController.obtenerBloqueosTrabajadoresUltimoMes);

module.exports = router;
