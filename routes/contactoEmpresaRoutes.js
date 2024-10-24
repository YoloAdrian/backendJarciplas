const express = require('express');
const { crearContacto, obtenerContactos, actualizarContacto, borrarContacto } = require('../controllers/contactoEmpresaController');
const router = express.Router();

// Ruta para crear un nuevo contacto
router.post('/contacto', crearContacto);

// Ruta para obtener todos los contactos
router.get('/contactos', obtenerContactos);

// Ruta para actualizar un contacto
router.put('/contacto/:id', actualizarContacto);

// Ruta para borrar un contacto
router.delete('/contacto/:id', borrarContacto);

module.exports = router;
