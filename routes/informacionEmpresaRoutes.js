const express = require('express');
const { obtenerInformacionEmpresa, actualizarInformacionEmpresa, obtenerLogoEmpresa } = require('../controllers/informacionEmpresaController');
const router = express.Router();
const multer = require('multer');
const upload = multer(); 

// Ruta para obtener la información de la empresa
router.get('/informacion', obtenerInformacionEmpresa);

// Ruta para actualizar la información de la empresa
router.put('/informacion/:id', upload.single('logo'), actualizarInformacionEmpresa);
// Ruta para obtener el logo de la empresa
router.get('/informacion/logo/:id', obtenerLogoEmpresa);


module.exports = router;
