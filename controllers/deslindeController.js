const DeslindeLegal = require('../models/deslindeLegalModel');

// Obtener todos los deslindes legales
const obtenerDeslindesLegales = async (req, res) => {
  try {
    const deslindes = await DeslindeLegal.findAll();
    res.json(deslindes);
  } catch (error) {
    console.error('Error al obtener los deslindes legales:', error);
    res.status(500).json({ error: 'Error al obtener los deslindes legales' });
  }
};

// Crear un nuevo deslinde legal
const crearDeslindeLegal = async (req, res) => {
  try {
    const { titulo, contenido } = req.body;

    if (!titulo || !contenido) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Marcar todos los deslindes actuales como "no vigente"
    await DeslindeLegal.update({ estado: 'no vigente' }, { where: { estado: 'vigente' } });

    // Obtener la última versión
    const ultimoDeslinde = await DeslindeLegal.findOne({ order: [['version', 'DESC']] });
    const nuevaVersion = ultimoDeslinde ? (ultimoDeslinde.version + 1) : 1;

    const nuevoDeslinde = await DeslindeLegal.create({
      titulo,
      contenido,
      fecha_vigencia: new Date().toISOString().split('T')[0], // Asignar fecha del sistema
      estado: 'vigente',
      version: nuevaVersion,
      fecha_creacion: new Date(),
    });

    res.json(nuevoDeslinde);
  } catch (error) {
    console.error('Error al crear el deslinde legal:', error);
    res.status(500).json({ error: 'Error al crear el deslinde legal' });
  }
};

// Modificar un deslinde legal
const modificarDeslindeLegal = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, fecha_vigencia, hacerVigente } = req.body;

    const deslindeExistente = await DeslindeLegal.findByPk(id);
    if (!deslindeExistente) {
      return res.status(404).json({ error: 'Deslinde legal no encontrado' });
    }

    if (hacerVigente) {
      await DeslindeLegal.update({ estado: 'no vigente' }, { where: { estado: 'vigente' } });
      deslindeExistente.estado = 'vigente';
    }

    deslindeExistente.titulo = titulo || deslindeExistente.titulo;
    deslindeExistente.contenido = contenido || deslindeExistente.contenido;
    deslindeExistente.fecha_vigencia = fecha_vigencia || deslindeExistente.fecha_vigencia;

    await deslindeExistente.save();

    res.json(deslindeExistente);
  } catch (error) {
    console.error('Error al modificar el deslinde legal:', error);
    res.status(500).json({ error: 'Error al modificar el deslinde legal' });
  }
};

// Marcar como eliminado un deslinde legal
const marcarComoEliminado = async (req, res) => {
  try {
    const { id } = req.params;

    const deslinde = await DeslindeLegal.findByPk(id);
    if (!deslinde) {
      return res.status(404).json({ error: 'Deslinde legal no encontrado' });
    }

    await DeslindeLegal.update({ estado: 'eliminada' }, { where: { id_deslinde: id } });
    res.json({ message: 'Deslinde legal marcado como eliminado' });
  } catch (error) {
    console.error('Error al marcar el deslinde legal como eliminado:', error);
    res.status(500).json({ error: 'Error al marcar el deslinde legal como eliminado' });
  }
};

// Obtener historial de versiones de un deslinde legal
const obtenerHistorialDeslindes = async (req, res) => {
  try {
    const { id } = req.params;

    const historial = await DeslindeLegal.findAll({ where: { id_deslinde: id } });
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener el historial de deslindes legales:', error);
    res.status(500).json({ error: 'Error al obtener el historial de deslindes legales' });
  }
};

// Obtener el deslinde legal vigente
const obtenerDeslindeVigente = async (req, res) => {
  try {
    const deslindeVigente = await DeslindeLegal.findOne({
      where: { estado: 'vigente' },
      order: [['fecha_vigencia', 'DESC']], // Ordenar por fecha de vigencia en caso de haber más de uno
    });

    if (!deslindeVigente) {
      return res.status(404).json({ error: 'No hay deslindes legales vigentes' });
    }

    res.json(deslindeVigente);
  } catch (error) {
    console.error('Error al obtener el deslinde legal vigente:', error);
    res.status(500).json({ error: 'Error al obtener el deslinde legal vigente' });
  }
};

module.exports = {
  obtenerDeslindesLegales,
  crearDeslindeLegal,
  modificarDeslindeLegal,
  marcarComoEliminado,
  obtenerHistorialDeslindes,
  obtenerDeslindeVigente,
};

