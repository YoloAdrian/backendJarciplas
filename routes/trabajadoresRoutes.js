const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/trabajadoresController');

router.get('/trabajadores', trabajadorController.obtenerTrabajadores);
router.get('/trabajadores/:id', trabajadorController.obtenerTrabajadorPorId);

module.exports = router;
