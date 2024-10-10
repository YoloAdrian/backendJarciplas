const express = require('express');
const router = express.Router();
const tipoTrabajadorController = require('../controllers/tipo_trabajadorController');

router.get('/tipos_trabajadores', tipoTrabajadorController.obtenerTiposTrabajadores);

module.exports = router;
