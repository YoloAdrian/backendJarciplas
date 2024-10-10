const Trabajador = require('../models/trabajadoresModel');

const obtenerTrabajadores = async (req, res) => {
  try {
    const trabajadores = await Trabajador.findAll();
    res.json(trabajadores);
  } catch (error) {
    console.error('Error al obtener los trabajadores:', error);
    res.status(500).json({ message: 'Error interno al obtener los trabajadores' });
  }
};

// Obtener trabajador por ID
const obtenerTrabajadorPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const trabajador = await Trabajador.findByPk(id);
    if (trabajador) {
      res.json(trabajador);
    } else {
      res.status(404).json({ message: 'Trabajador no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el trabajador:', error);
    res.status(500).json({ message: 'Error interno al obtener el trabajador' });
  }
};

module.exports = {
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
};
