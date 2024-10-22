const express = require('express');
const router = express.Router();
const terminosController = require('../controllers/terminosControllers');

router.get('/terminos', terminosController.obtenerTerminos);
router.post('/terminos', terminosController.crearTermino);

module.exports = router;
