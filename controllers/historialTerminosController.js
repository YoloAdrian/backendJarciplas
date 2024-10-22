const HistorialTerminos = require('../models/historialTerminosModal');

const obtenerHistorialTerminos = async (req, res) => {
  try {
    const historial = await HistorialTerminos.findAll();
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de términos' });
  }
};

const crearHistorialTermino = async (req, res) => {
  try {
    const historial = await HistorialTerminos.create(req.body);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el historial de términos' });
  }
};

module.exports = {
  obtenerHistorialTerminos,
  crearHistorialTermino
};
