const Trabajador = require('../models/trabajadoresModel');
const crypto = require('crypto');

// Función para generar un ID de sesión único
const generarIdSesion = () => {
  return crypto.randomBytes(32).toString('hex'); // Genera un ID de 64 caracteres
};

const obtenerTrabajadores = async (req, res) => {
  try {
    const trabajadores = await Trabajador.findAll();
    res.json(trabajadores);
  } catch (error) {
    console.error('Error al obtener los trabajadores:', error);
    res.status(500).json({ message: 'Error interno al obtener los trabajadores' });
  }
};

// Obtener trabajador por ID
const obtenerTrabajadorPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const trabajador = await Trabajador.findByPk(id);
    if (trabajador) {
      res.json(trabajador);
    } else {
      res.status(404).json({ message: 'Trabajador no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el trabajador:', error);
    res.status(500).json({ message: 'Error interno al obtener el trabajador' });
  }
};

// Crear un nuevo trabajador
const crearTrabajador = async (req, res) => {
  const { Nombre, Apellido_Paterno, Apellido_Materno, Correo, telefono, id_tipo_trabajador, Contraseña } = req.body;

  try {
    // Validación de campos requeridos
    if (!Nombre || !Apellido_Paterno || !Apellido_Materno || !Correo || !telefono || !id_tipo_trabajador || !Contraseña) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Generar un nuevo ID de sesión
    const id_sesion = generarIdSesion();
    
    // Almacenar el ID de sesión en una cookie con atributos de seguridad
    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // La cookie expira en 24 horas
    });

    // Crear el nuevo trabajador en la base de datos
    const nuevoTrabajador = await Trabajador.create({
      Nombre,
      Apellido_Paterno,
      Apellido_Materno,
      Correo,
      telefono,
      id_tipo_trabajador,
      Contraseña,
      id_sesion // Guardar el ID de sesión en la base de datos
    });

    // Devolver el nuevo trabajador creado
    res.status(201).json(nuevoTrabajador);
  } catch (error) {
    console.error('Error al crear el trabajador:', error);
    res.status(500).json({ message: 'Error interno al crear el trabajador' });
  }
};


const iniciarSesionTrabajador = async (req, res) => {
  const { Correo, Contraseña } = req.body; // Asegúrate de que estás pasando los datos correctos

  try {
    const trabajador = await Trabajador.findOne({ where: { Correo: Correo } });
    if (!trabajador || trabajador.Contraseña !== Contraseña) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Generar un nuevo ID de sesión
    const id_sesion = generarIdSesion();

    // Reemplazar el ID de sesión anterior por el nuevo
    trabajador.id_sesion = id_sesion;
    await trabajador.save(); // Guardar el nuevo ID de sesión en la base de datos

    // Establecer la cookie de sesión
    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // La cookie expira en 24 horas
    });

    res.status(200).json(trabajador);
  } catch (error) {
    console.error('Error al iniciar sesión del trabajador:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesión.' });
  }
};

module.exports = {
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
  crearTrabajador,
  iniciarSesionTrabajador,
};
