const axios = require('axios');
const Usuario = require('../models/usuariosModel');
const Trabajador = require('../models/trabajadoresModel'); // Asegúrate de importar el modelo de Trabajador
const crypto = require('crypto');
const FrecuenciaBloqueosUsuarios = require('../models/frecuenciaBloqueosUsuariosModel');

const generarIdSesion = () => {
  return crypto.randomBytes(32).toString('hex');
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

// Crear un nuevo usuario
const crearUsuario = async (req, res) => {
  const { Nombre, Apellido_Paterno, Apellido_Materno, Edad, Genero, Correo, Telefono, Contraseña, id_tipo_usuario } = req.body;

  try {
    if (!Nombre || !Apellido_Paterno || !Apellido_Materno || !Edad || !Genero || !Correo || !Telefono || !Contraseña || !id_tipo_usuario) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const telefonoStr = String(Telefono);

    const id_sesion = generarIdSesion();

    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // Cookie expira en 24 horas
    });

    const nuevoUsuario = await Usuario.create({
      Nombre,
      Apellido_Paterno,
      Apellido_Materno,
      Edad,
      Genero,
      Correo,
      Telefono: telefonoStr,
      Contraseña,
      Intentos_contraseña: 0,
      id_sesion,
      id_tipo_usuario // Asignar el valor correcto aquí
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error interno al crear el usuario', error: error.message });
  }
};

// Iniciar sesión del usuario
const iniciarSesionUsuario = async (req, res) => {
  const { Correo, Contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { Correo: Correo } });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    if (usuario.Intentos_contraseña >= 5) {
      const tiempoBloqueoRestante = usuario.bloqueadoHasta - Date.now();

      if (tiempoBloqueoRestante > 0) {
        const segundosRestantes = Math.floor(tiempoBloqueoRestante / 1000);
        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta de nuevo en ${segundosRestantes} segundos.`,
        });
      } else {
        usuario.Intentos_contraseña = 0;
        usuario.bloqueadoHasta = null;
        await usuario.save();
      }
    }

    if (usuario.Contraseña !== Contraseña) {
      usuario.Intentos_contraseña += 1;

      if (usuario.Intentos_contraseña >= 5) {
        usuario.bloqueadoHasta = Date.now() + 1 * 60 * 1000; // Bloquear por 1 minuto

        await FrecuenciaBloqueosUsuarios.create({
          id_usuario: usuario.id_usuarios,
          fecha: new Date(),
        });
      }

      await usuario.save();
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    usuario.Intentos_contraseña = 0;
    usuario.bloqueadoHasta = null;

    const id_sesion = generarIdSesion();
    usuario.id_sesion = id_sesion;

    await usuario.save();

    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // Cookie expira en 24 horas
    });

    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al iniciar sesión del usuario:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesión.' });
  }
};

// Cambiar el rol de un usuario a trabajador
const cambiarRol = async (req, res) => {
  const id = req.params.id;
  const { nuevoTipoUsuario } = req.body; 

  try {
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Crear trabajador con los datos del usuario
    const nuevoTrabajador = await Trabajador.create({
      Nombre: usuario.Nombre,
      Apellido_Paterno: usuario.Apellido_Paterno,
      Apellido_Materno: usuario.Apellido_Materno,
      Edad: usuario.Edad, // Tomar edad del usuario
      Genero: usuario.Genero,
      Correo: usuario.Correo,
      Telefono: usuario.Telefono,
      Contraseña: usuario.Contraseña,
      id_tipo_usuario: nuevoTipoUsuario // Usar el nuevo rol recibido
    });

    // Eliminar usuario después de crear el trabajador
    await usuario.destroy();

    res.status(201).json(nuevoTrabajador);
  } catch (error) {
    console.error('Error al cambiar el rol del usuario:', error);
    res.status(500).json({ message: 'Error interno al cambiar el rol del usuario' });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  iniciarSesionUsuario,
  cambiarRol,
};
