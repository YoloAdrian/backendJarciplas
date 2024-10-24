const Terminos = require('../models/terminosModal');

const obtenerTerminos = async (req, res) => {
  try {
    const terminos = await Terminos.findAll();
    res.json(terminos);
  } catch (error) {
    console.error('Error al obtener los términos:', error);
    res.status(500).json({ error: 'Error al obtener los términos' });
  }
};

const crearTerminos = async (req, res) => {
  try {
    const { titulo, contenido } = req.body;

    if (!titulo || !contenido) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    await Terminos.update({ estado: 'no vigente' }, { where: { estado: 'vigente' } });

    const ultimoTermino = await Terminos.findOne({ order: [['version', 'DESC']] });
    const nuevaVersion = ultimoTermino ? (ultimoTermino.version + 1) : 1;

    const terminos = await Terminos.create({
      titulo,
      contenido,
      fecha_vigencia: new Date().toISOString().split('T')[0],
      estado: 'vigente',
      version: nuevaVersion,
      fecha_creacion: new Date(),
    });

    res.json(terminos);
  } catch (error) {
    console.error('Error al crear los términos:', error);
    res.status(500).json({ error: 'Error al crear los términos' });
  }
};

const modificarTerminos = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, fecha_vigencia, hacerVigente } = req.body;

    const terminosExistente = await Terminos.findByPk(id);
    if (!terminosExistente) {
      return res.status(404).json({ error: 'Términos no encontrados' });
    }

    if (hacerVigente) {
      await Terminos.update({ estado: 'no vigente' }, { where: { estado: 'vigente' } });
      terminosExistente.estado = 'vigente';
    }

    terminosExistente.titulo = titulo || terminosExistente.titulo;
    terminosExistente.contenido = contenido || terminosExistente.contenido;
    terminosExistente.fecha_vigencia = fecha_vigencia || terminosExistente.fecha_vigencia;

    await terminosExistente.save();

    res.json(terminosExistente);
  } catch (error) {
    console.error('Error al modificar los términos:', error);
    res.status(500).json({ error: 'Error al modificar los términos' });
  }
};

const marcarComoEliminado = async (req, res) => {
  try {
    const { id } = req.params;

    const terminos = await Terminos.findByPk(id);
    if (!terminos) {
      return res.status(404).json({ error: 'Términos no encontrados' });
    }

    await Terminos.update({ estado: 'eliminada' }, { where: { id_terminos: id } });
    res.json({ message: 'Términos marcados como eliminados' });
  } catch (error) {
    console.error('Error al marcar los términos como eliminados:', error);
    res.status(500).json({ error: 'Error al marcar los términos como eliminados' });
  }
};

const obtenerHistorialTerminos = async (req, res) => {
  try {
    const { id } = req.params;

    const historial = await Terminos.findAll({ where: { id_terminos: id } });
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener el historial de términos:', error);
    res.status(500).json({ error: 'Error al obtener el historial de términos' });
  }
};

const obtenerTerminosVigentes = async (req, res) => {
  try {
    // Buscar términos con estado "vigente"
    const terminosVigente = await Terminos.findOne({
      where: { estado: 'vigente' }
    });

    if (!terminosVigente) {
      return res.status(404).json({ error: 'No hay términos vigentes' });
    }

    res.json(terminosVigente);
  } catch (error) {
    console.error('Error al obtener los términos vigentes:', error);
    res.status(500).json({ error: 'Error al obtener los términos vigentes' });
  }
};


module.exports = {
  obtenerTerminos,
  crearTerminos,
  modificarTerminos,
  marcarComoEliminado,
  obtenerHistorialTerminos,
  obtenerTerminosVigentes
};
