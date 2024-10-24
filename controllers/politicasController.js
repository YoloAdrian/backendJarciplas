const Politica = require('../models/politicaModel');

const obtenerPoliticas = async (req, res) => {
  try {
    const politicas = await Politica.findAll();
    res.json(politicas);
  } catch (error) {
    console.error('Error al obtener las políticas:', error);
    res.status(500).json({ error: 'Error al obtener las políticas' });
  }
};

const crearPolitica = async (req, res) => {
  try {
    const { titulo, contenido } = req.body; // Se eliminó fecha_vigencia del body

    if (!titulo || !contenido) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    await Politica.update({ estado: 'no vigente' }, { where: { estado: 'vigente' } });

    const ultimaPolitica = await Politica.findOne({ order: [['version', 'DESC']] });
    const nuevaVersion = ultimaPolitica ? (ultimaPolitica.version + 1) : 1;

    const politica = await Politica.create({
      titulo,
      contenido,
      fecha_vigencia: new Date().toISOString().split('T')[0], // Asignar fecha del sistema
      estado: 'vigente',
      version: nuevaVersion,
      fecha_creacion: new Date(),
    });

    res.json(politica);
  } catch (error) {
    console.error('Error al crear la política:', error);
    res.status(500).json({ error: 'Error al crear la política' });
  }
};

const modificarPolitica = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, fecha_vigencia, hacerVigente } = req.body;

    const politicaExistente = await Politica.findByPk(id);
    if (!politicaExistente) {
      return res.status(404).json({ error: 'Política no encontrada' });
    }

    if (hacerVigente) {
      await Politica.update({ estado: 'no vigente' }, { where: { estado: 'vigente' } });
      politicaExistente.estado = 'vigente';
    }

    politicaExistente.titulo = titulo || politicaExistente.titulo;
    politicaExistente.contenido = contenido || politicaExistente.contenido;
    politicaExistente.fecha_vigencia = fecha_vigencia || politicaExistente.fecha_vigencia;

    await politicaExistente.save();

    res.json(politicaExistente);
  } catch (error) {
    console.error('Error al modificar la política:', error);
    res.status(500).json({ error: 'Error al modificar la política' });
  }
};

const marcarComoEliminada = async (req, res) => {
  try {
    const { id } = req.params;

    const politica = await Politica.findByPk(id);
    if (!politica) {
      return res.status(404).json({ error: 'Política no encontrada' });
    }

    await Politica.update({ estado: 'eliminada' }, { where: { id_politica: id } });
    res.json({ message: 'Política marcada como eliminada' });
  } catch (error) {
    console.error('Error al marcar la política como eliminada:', error);
    res.status(500).json({ error: 'Error al marcar la política como eliminada' });
  }
};

const obtenerHistorialPoliticas = async (req, res) => {
  try {
    const { id } = req.params;

    const historial = await Politica.findAll({ where: { id_politica: id } });
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener el historial de políticas:', error);
    res.status(500).json({ error: 'Error al obtener el historial de políticas' });
  }
};

// Obtener la política vigente
const obtenerPoliticaVigente = async (req, res) => {
  try {
    const politicaVigente = await Politica.findOne({
      where: { estado: 'vigente' },
      order: [['fecha_vigencia', 'DESC']], // Ordenar por fecha de vigencia en caso de haber más de una
    });

    if (!politicaVigente) {
      return res.status(404).json({ error: 'No hay políticas vigentes disponibles' });
    }

    res.json(politicaVigente);
  } catch (error) {
    console.error('Error al obtener la política vigente:', error);
    res.status(500).json({ error: 'Error al obtener la política vigente' });
  }
};

module.exports = {
  obtenerPoliticas,
  crearPolitica,
  modificarPolitica,
  marcarComoEliminada,
  obtenerHistorialPoliticas,
  obtenerPoliticaVigente, // Añadir al export
};
