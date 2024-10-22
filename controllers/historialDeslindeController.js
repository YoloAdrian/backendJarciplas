const HistorialDeslinde = require('../models/deslindeLegalModel');

const obtenerHistorialDeslindes = async (req, res) => {
  try {
    const historial = await HistorialDeslinde.findAll();
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de deslindes legales' });
  }
};

const crearHistorialDeslinde = async (req, res) => {
  try {
    const historial = await HistorialDeslinde.create(req.body);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el historial de deslinde' });
  }
};

module.exports = {
  obtenerHistorialDeslindes,
  crearHistorialDeslinde
};
