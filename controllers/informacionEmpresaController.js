const InformacionEmpresa = require('../models/informacionEmpresaModel');

// Consulta la información de la empresa
const obtenerInformacionEmpresa = async (req, res) => {
  try {
    const informacion = await InformacionEmpresa.findAll();
    res.status(200).json(informacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la información de la empresa' });
  }
};

// Actualiza la información de la empresa
const actualizarInformacionEmpresa = async (req, res) => {
  const { id } = req.params; // Obteniendo el ID de la URL
  const { nombre, eslogan } = req.body; // Obteniendo los datos del cuerpo de la solicitud
  let logo = req.file ? req.file.buffer : null; // Obteniendo el logo del archivo

  try {
    // Obteniendo la información actual de la empresa para preservar los datos no actualizados
    const empresa = await InformacionEmpresa.findByPk(id);

    if (!empresa) {
      return res.status(404).json({ message: 'Información de la empresa no encontrada' });
    }

    // Actualizando solo los campos que no sean undefined o null
    const updatedEmpresa = {
      nombre: nombre || empresa.nombre,
      eslogan: eslogan || empresa.eslogan,
      logo: logo || empresa.logo, // Mantener el logo anterior si no se envía uno nuevo
    };

    // Realizando la actualización
    await InformacionEmpresa.update(updatedEmpresa, { where: { id_informacion: id } });

    res.status(200).json({ message: 'Información de la empresa actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la información de la empresa' });
  }
};

  
  

// Obtener la imagen de la empresa
const obtenerLogoEmpresa = async (req, res) => {
    const { id} = req.params;
  
    try {
      const empresa = await InformacionEmpresa.findByPk(id);
  
      if (!empresa) {
        return res.status(404).json({ message: 'Empresa no encontrada' });
      }
  
      // Establecer el tipo de contenido 
      res.set('Content-Type', 'image/jpg'); 
      res.send(empresa.logo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener la imagen de la empresa' });
    }
  };
  

module.exports = {
  obtenerInformacionEmpresa,
  actualizarInformacionEmpresa,
  obtenerLogoEmpresa,
};
