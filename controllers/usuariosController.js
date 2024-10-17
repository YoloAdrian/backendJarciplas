const axios = require('axios');
const Usuario = require('../models/usuariosModel');
const crypto = require('crypto');


const generarIdSesion = () => {
  return crypto.randomBytes(32).toString('hex'); // Genera un ID de 64 caracteres
};

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error interno al obtener los usuarios' });
  }
};

// Obtener usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const usuario = await Usuario.findByPk(id);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error interno al obtener el usuario' });
  }
};

// Crear nuevo usuario
const crearUsuario = async (req, res) => {
  const { Nombre, Apellido_Paterno, Apellido_Materno, Edad, Genero, Correo, Telefono, Contraseña } = req.body;

  try {
    // Validar que todos los campos requeridos estén presentes
    if (!Nombre || !Apellido_Paterno || !Apellido_Materno || !Edad || !Genero || !Correo || !Telefono || !Contraseña) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Generar un ID de sesión aleatorio y seguro
    const id_sesion = randomBytes(32).toString('hex');

    // Establecer la cookie de sesión con atributos de seguridad
    res.cookie('sessionId', id_sesion, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', // Solo se envía en HTTPS en producción
      sameSite: 'Strict', // Restricciones para prevenir ataques CSRF
      maxAge: 24 * 60 * 60 * 1000 // La cookie expira en 24 horas
    });

    // Crear el nuevo usuario incluyendo 'id_sesion'
    const nuevoUsuario = await Usuario.create({
      Nombre,
      Apellido_Paterno,
      Apellido_Materno,
      Edad,
      Genero,
      Correo,
      Telefono,
      Contraseña,
      id_sesion // Se añade el ID de sesión generado
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error interno al crear el usuario', error: error.message });
  }
};


const iniciarSesionUsuario = async (req, res) => {
  const { Correo, Contraseña } = req.body; // Asegúrate de que estás pasando los datos correctos

  try {
    const usuario = await Usuario.findOne({ where: { Correo: Correo } });
    if (!usuario || usuario.Contraseña !== Contraseña) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Generar un nuevo ID de sesión
    const id_sesion = generarIdSesion();

    // Reemplazar el ID de sesión anterior por el nuevo
    usuario.id_sesion = id_sesion;
    await usuario.save(); // Guardar el nuevo ID de sesión en la base de datos

    // Establecer la cookie de sesión
    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // La cookie expira en 24 horas
    });

    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al iniciar sesión del usuario:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesión.' });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  iniciarSesionUsuario,
};
