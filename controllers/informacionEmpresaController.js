const Informacion = require('../models/informacionEmpresaModel');

// Obtener toda la información
const obtenerInformacion = async (req, res) => {
  try {
    const informacion = await Informacion.findAll();
    res.json(informacion);
  } catch (error) {
    console.error('Error al obtener la información:', error);
    res.status(500).json({ message: 'Error interno al obtener la información' });
  }
};

const obtenerInformacionPorId = async (req, res) => {
  const id = req.params.id;

  try {
    const informacion = await Informacion.findByPk(id);
    if (!informacion) {
      return res.status(404).json({ message: 'Información no encontrada' });
    }
    res.json(informacion);
  } catch (error) {
    console.error('Error al obtener la información:', error);
    res.status(500).json({ message: 'Error interno al obtener la información' });
  }
};

// Crear nueva información
const crearInformacion = async (req, res) => {
  const { id_tipo_informacion, informacion } = req.body;

  try {
    if (!id_tipo_informacion || !informacion) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const nuevaInformacion = await Informacion.create({ id_tipo_informacion, informacion });
    res.status(201).json(nuevaInformacion);
  } catch (error) {
    console.error('Error al crear la información:', error);
    res.status(500).json({ message: 'Error interno al crear la información', error: error.message });
  }
};

// Editar información
const editarInformacion = async (req, res) => {
  const id = req.params.id;
  const { id_tipo_informacion, informacion } = req.body;

  try {
    const informacionExistente = await Informacion.findByPk(id);
    if (!informacionExistente) {
      return res.status(404).json({ message: 'Información no encontrada' });
    }

    await Informacion.update({ id_tipo_informacion, informacion }, { where: { id_informacion: id } });
    res.json({ message: 'Información actualizada correctamente' });
  } catch (error) {
    console.error('Error al editar la información:', error);
    res.status(500).json({ message: 'Error interno al editar la información' });
  }
};

// Eliminar información (borrar registro completo)
const eliminarInformacion = async (req, res) => {
  const id = req.params.id;

  try {
    const informacionExistente = await Informacion.findByPk(id);
    if (!informacionExistente) {
      return res.status(404).json({ message: 'Información no encontrada' });
    }

    await Informacion.destroy({ where: { id_informacion: id } });
    res.json({ message: 'Información eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la información:', error);
    res.status(500).json({ message: 'Error interno al eliminar la información' });
  }
};

// Eliminar solo el campo 'informacion'
const eliminarCampoInformacion = async (req, res) => {
    const id = req.params.id;
  
    try {
      const informacionExistente = await Informacion.findByPk(id);
      if (!informacionExistente) {
        return res.status(404).json({ message: 'Información no encontrada' });
      }
  
      await Informacion.update({ informacion: null }, { where: { id_informacion: id } });
      res.json({ message: 'Campo "informacion" eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el campo información:', error);
      res.status(500).json({ message: 'Error interno al eliminar el campo información' });
    }
  };
  

module.exports = {
  obtenerInformacion,
  crearInformacion,
  editarInformacion,
  eliminarInformacion,
  eliminarCampoInformacion, 
  obtenerInformacionPorId,
};
