const express = require('express');
const router = express.Router();
const informacionController = require('../controllers/informacionEmpresaController');

router.get('/informacion', informacionController.obtenerInformacion);
router.post('/informacion', informacionController.crearInformacion);
router.put('/informacion/:id', informacionController.editarInformacion);
router.delete('/informacion/:id', informacionController.eliminarInformacion);
router.delete('/informacion/campo/:id', informacionController.eliminarCampoInformacion); 

module.exports = router;
