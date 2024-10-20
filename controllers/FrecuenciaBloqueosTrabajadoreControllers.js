const FrecuenciaBloqueoTrabajadores = require('../models/frecuenciaBloqueosTrabajadoresModel');

// Obtener todas las frecuencias de bloqueos de trabajadores
const obtenerFrecuenciaBloqueosTrabajadores = async (req, res) => {
  try {
    const bloqueos = await FrecuenciaBloqueoTrabajadores.findAll();
    res.json(bloqueos);
  } catch (error) {
    console.error('Error al obtener las frecuencias de bloqueos de trabajadores:', error);
    res.status(500).json({ message: 'Error interno al obtener las frecuencias de bloqueos de trabajadores' });
  }
};

// Crear un nuevo registro de bloqueo para un trabajador
const crearFrecuenciaBloqueoTrabajadores = async (req, res) => {
  const { id_trabajadores, fecha } = req.body;

  try {
    // Validar que todos los campos requeridos estén presentes
    if (!id_trabajadores || !fecha) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Crear un nuevo registro en la tabla de bloqueos
    const nuevoBloqueo = await FrecuenciaBloqueoTrabajadores.create({
      id_trabajadores,
      fecha,
    });

    res.status(201).json(nuevoBloqueo);
  } catch (error) {
    console.error('Error al crear la frecuencia de bloqueo para trabajadores:', error);
    res.status(500).json({ message: 'Error interno al crear la frecuencia de bloqueo para trabajadores' });
  }
};

// Obtener bloqueos por ID de trabajador
const obtenerBloqueosPorTrabajador = async (req, res) => {
  const { id_trabajadores } = req.params;
  try {
    const bloqueos = await FrecuenciaBloqueoTrabajadores.findAll({ where: { id_trabajadores } });
    res.json(bloqueos);
  } catch (error) {
    console.error('Error al obtener los bloqueos del trabajador:', error);
    res.status(500).json({ message: 'Error interno al obtener los bloqueos del trabajador' });
  }
};

module.exports = {
  obtenerFrecuenciaBloqueosTrabajadores,
  crearFrecuenciaBloqueoTrabajadores,
  obtenerBloqueosPorTrabajador,
};
