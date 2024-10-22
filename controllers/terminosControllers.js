const Terminos = require('../models/terminosModal');

const obtenerTerminos = async (req, res) => {
  try {
    const terminos = await Terminos.findAll();
    res.json(terminos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los términos' });
  }
};

const crearTermino = async (req, res) => {
  try {
    const termino = await Terminos.create(req.body);
    res.json(termino);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el término' });
  }
};

module.exports = {
  obtenerTerminos,
  crearTermino
};
