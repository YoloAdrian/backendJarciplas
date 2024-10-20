const TipoUsuario = require('../models/tipo_UsuarioModel');

const obtenerTiposUsuarios = async (req, res) => {
  try {
    const tipos = await TipoUsuario.findAll();
    res.json(tipos);
  } catch (error) {
    console.error('Error al obtener los tipos de usuarios:', error);
    res.status(500).json({ message: 'Error interno al obtener los tipos de usuarios' });
  }
};

module.exports = {
  obtenerTiposUsuarios,
};

