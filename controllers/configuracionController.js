const Configuracion = require('../models/configuracionModel');

// Actualizar la cantidad de errores en la configuración
const actualizarConfiguracion = async (req, res) => {
  const { id } = req.params;
  const { cantidad_errores } = req.body;

  try {
    const [updated] = await Configuracion.update(
      { cantidad_errores },
      { where: { id_configuracion: id } }
    );

    if (updated) {
      res.status(200).json({ message: 'Configuración actualizada correctamente' });
    } else {
      res.status(404).json({ message: 'Configuración no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la configuración' });
  }
};

const obtenerConfiguracion = async (req, res) => {
    const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  
    try {
      const configuracion = await Configuracion.findByPk(id); // Busca la configuración por ID
  
      if (!configuracion) {
        return res.status(404).json({ message: 'Configuración no encontrada' });
      }
  
      res.status(200).json(configuracion); // Devuelve la configuración encontrada
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener la configuración' });
    }
  };

  const obtenerCantidadErrores = async (req, res) => {
    const { id } = req.params;
  
    try {
      const configuracion = await Configuracion.findByPk(id, {
        attributes: ['cantidad_errores'] // Selecciona solo el campo cantidad_errores
      });
  
      if (!configuracion) {
        return res.status(404).json({ message: 'Configuración no encontrada' });
      }
  
      res.status(200).json(configuracion);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener la cantidad de errores' });
    }
  };

module.exports = {
  actualizarConfiguracion,
  obtenerConfiguracion,
  obtenerCantidadErrores,
};
