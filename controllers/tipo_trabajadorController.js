const TipoTrabajador = require('../models/tipo_trabajadorModel');

const obtenerTiposTrabajadores = async (req, res) => {
  try {
    const tipos = await TipoTrabajador.findAll();
    res.json(tipos);
  } catch (error) {
    console.error('Error al obtener los tipos de trabajadores:', error);
    res.status(500).json({ message: 'Error interno al obtener los tipos de trabajadores' });
  }
};

module.exports = {
  obtenerTiposTrabajadores,
};
