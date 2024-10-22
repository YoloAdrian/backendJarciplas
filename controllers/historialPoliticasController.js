const HistorialPolitica = require('../models/historialPoliticaModel');

const obtenerHistorialPoliticas = async (req, res) => {
  try {
    const historial = await HistorialPolitica.findAll();
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de políticas de privacidad' });
  }
};

const crearHistorialPolitica = async (req, res) => {
  try {
    const historial = await HistorialPolitica.create(req.body);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el historial de política' });
  }
};

module.exports = {
  obtenerHistorialPoliticas,
  crearHistorialPolitica
};
