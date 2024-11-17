const express = require('express');
const router = express.Router();
const frecuenciaBloqueoController = require('../controllers/FrecuenciaBloqueosUsuariosControllers');


router.get('/frecuencia_bloqueos_usuarios', frecuenciaBloqueoController.obtenerFrecuenciaBloqueos);


router.post('/frecuencia_bloqueos_usuarios', frecuenciaBloqueoController.crearFrecuenciaBloqueo);


router.get('/frecuencia_bloqueos_usuarios/:id_usuario', frecuenciaBloqueoController.obtenerBloqueosPorUsuario);
router.get('/frecuencia_bloqueos_usuarios/ultimo_dia', frecuenciaBloqueoController.obtenerBloqueosUsuariosUltimoDia);
router.get('/frecuencia_bloqueos_usuarios/ultima_semana', frecuenciaBloqueoController.obtenerBloqueosUsuariosUltimaSemana);
router.get('/frecuencia_bloqueos_usuarios/ultimo_mes', frecuenciaBloqueoController.obtenerBloqueosUsuariosUltimoMes);

module.exports = router;
