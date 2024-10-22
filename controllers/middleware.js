// middleware/verificarSesion.js
const Trabajador = require('../models/trabajadoresModel'); // Importa tu modelo Trabajador
const Usuario = require('../models/usuariosModel'); // Importa tu modelo Usuario

const verificarSesion = async (req, res, next) => {
  const idSesion = req.cookies.id_sesion; // Obtén el id_sesion de las cookies

  if (!idSesion) {
    return res.status(401).json({ mensaje: 'No autorizado. Falta ID de sesión.' });
  }

  try {
    // Buscar en la base de datos si la sesión es válida (tanto en trabajadores como en usuarios)
    const trabajador = await Trabajador.findOne({ where: { id_sesion: idSesion } });
    const usuario = await Usuario.findOne({ where: { id_sesion: idSesion } });

    if (!trabajador && !usuario) {
      return res.status(401).json({ mensaje: 'Sesión no válida. No autorizado.' });
    }

    // Si el trabajador o usuario es encontrado, continúa con la solicitud
    req.trabajador = trabajador || null;
    req.usuario = usuario || null;
    next();
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error en la verificación de sesión.', error });
  }
};

module.exports = verificarSesion;
