const FrecuenciaBloqueoTrabajadores = require('../models/frecuenciaBloqueosTrabajadoresModel');
const { Op } = require('sequelize');

// Obtener todas las frecuencias de bloqueos de trabajadores
const obtenerFrecuenciaBloqueosTrabajadores = async (req, res) => {
  try {
    const bloqueos = await FrecuenciaBloqueoTrabajadores.findAll();
    res.json(bloqueos);
  } catch (error) {
    console.error('Error al obtener las frecuencias de bloqueos:', error);
    res.status(500).json({ message: 'Error interno al obtener las frecuencias de bloqueos' });
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


const obtenerBloqueosTrabajadoresUltimoDia = async (req, res) => {
  try {
    const ahora = new Date();
    const inicioDelDia = new Date(ahora);
    inicioDelDia.setHours(0, 0, 0, 0);

    const bloqueos = await FrecuenciaBloqueoTrabajadores.findAll({
      where: {
        fecha: {
          [Op.between]: [inicioDelDia.toISOString(), ahora.toISOString()]
        }
      }
    });

    res.json(bloqueos);
  } catch (error) {
    console.error('Error al obtener bloqueos de trabajadores del último día:', error);
    res.status(500).json({ message: 'Error interno al obtener bloqueos de trabajadores del último día' });
  }
};

const obtenerBloqueosTrabajadoresUltimaSemana = async (req, res) => {
  try {
    const ahora = new Date();
    const haceUnaSemana = new Date(ahora);
    haceUnaSemana.setDate(ahora.getDate() - 7);
    haceUnaSemana.setHours(0, 0, 0, 0);

    const bloqueos = await FrecuenciaBloqueoTrabajadores.findAll({
      where: {
        fecha: {
          [Op.between]: [haceUnaSemana.toISOString(), ahora.toISOString()]
        }
      }
    });

    res.json(bloqueos);
  } catch (error) {
    console.error('Error al obtener bloqueos de trabajadores de la última semana:', error);
    res.status(500).json({ message: 'Error interno al obtener bloqueos de trabajadores de la última semana' });
  }
};

const obtenerBloqueosTrabajadoresUltimoMes = async (req, res) => {
  try {
    const ahora = new Date();
    const haceUnMes = new Date(ahora);
    haceUnMes.setMonth(ahora.getMonth() - 1);
    haceUnMes.setHours(0, 0, 0, 0);

    const bloqueos = await FrecuenciaBloqueoTrabajadores.findAll({
      where: {
        fecha: {
          [Op.between]: [haceUnMes.toISOString(), ahora.toISOString()]
        }
      }
    });

    res.json(bloqueos);
  } catch (error) {
    console.error('Error al obtener bloqueos de trabajadores del último mes:', error);
    res.status(500).json({ message: 'Error interno al obtener bloqueos de trabajadores del último mes' });
  }
};



module.exports = {
  obtenerFrecuenciaBloqueosTrabajadores,
  crearFrecuenciaBloqueoTrabajadores,
  obtenerBloqueosPorTrabajador,
  obtenerBloqueosTrabajadoresUltimoDia,
  obtenerBloqueosTrabajadoresUltimaSemana,
  obtenerBloqueosTrabajadoresUltimoMes,
};