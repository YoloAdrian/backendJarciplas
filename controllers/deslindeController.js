const DeslindeLegal = require('../models/deslindeLegalModel');

const obtenerDeslindesLegales = async (req, res) => {
  try {
    const deslindes = await DeslindeLegal.findAll();
    res.json(deslindes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los deslindes legales' });
  }
};

const crearDeslindeLegal = async (req, res) => {
  try {
    const deslinde = await DeslindeLegal.create(req.body);
    res.json(deslinde);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el deslinde legal' });
  }
};

module.exports = {
  obtenerDeslindesLegales,
  crearDeslindeLegal
};
