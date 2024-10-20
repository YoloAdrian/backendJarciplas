const FrecuenciaBloqueo = require('../models/frecuenciaBloqueosUsuariosModel');

// Obtener todas las frecuencias de bloqueos
const obtenerFrecuenciaBloqueos = async (req, res) => {
  try {
    const bloqueos = await FrecuenciaBloqueo.findAll();
    res.json(bloqueos);
  } catch (error) {
    console.error('Error al obtener las frecuencias de bloqueos:', error);
    res.status(500).json({ message: 'Error interno al obtener las frecuencias de bloqueos' });
  }
};

// Crear un nuevo registro de bloqueo
const crearFrecuenciaBloqueo = async (req, res) => {
  const { id_usuario, fecha } = req.body;

  try {
    // Validar que todos los campos requeridos estén presentes
    if (!id_usuario || !fecha) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Crear un nuevo registro en la tabla de bloqueos
    const nuevoBloqueo = await FrecuenciaBloqueo.create({
      id_usuario,
      fecha,
    });

    res.status(201).json(nuevoBloqueo);
  } catch (error) {
    console.error('Error al crear la frecuencia de bloqueo:', error);
    res.status(500).json({ message: 'Error interno al crear la frecuencia de bloqueo' });
  }
};

// Obtener bloqueos por ID de usuario
const obtenerBloqueosPorUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const bloqueos = await FrecuenciaBloqueo.findAll({ where: { id_usuario } });
    res.json(bloqueos);
  } catch (error) {
    console.error('Error al obtener los bloqueos del usuario:', error);
    res.status(500).json({ message: 'Error interno al obtener los bloqueos del usuario' });
  }
};

module.exports = {
  obtenerFrecuenciaBloqueos,
  crearFrecuenciaBloqueo,
  obtenerBloqueosPorUsuario,
};
