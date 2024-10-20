const axios = require('axios');
const Usuario = require('../models/usuariosModel');
const Trabajador = require('../models/trabajadoresModel');
const TipoUsuario = require('../models/tipo_UsuarioModel');
const crypto = require('crypto');
const FrecuenciaBloqueosUsuarios = require('../models/frecuenciaBloqueosUsuariosModel');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generarIdSesion = () => {
  return crypto.randomBytes(32).toString('hex');
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error interno al obtener los usuarios' });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  const id_usuarios = req.params.id_usuarios; // Cambiar a id_usuarios
  try {
    const usuario = await Usuario.findByPk(id_usuarios);
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

const crearUsuario = async (req, res) => {
  const { Nombre, Apellido_Paterno, Apellido_Materno, Edad, Genero, Correo, Telefono, Contraseña, id_tipo_usuario } = req.body;

  try {
    if (!Nombre || !Apellido_Paterno || !Apellido_Materno || !Edad || !Genero || !Correo || !Telefono || !Contraseña || !id_tipo_usuario) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const telefonoStr = String(Telefono);
    const id_sesion = generarIdSesion();
    const secret = speakeasy.generateSecret({ length: 20 });
    const mfaSecret = secret.base32;

    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000
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
      id_tipo_usuario,
      secret_mfa: mfaSecret // Guardar el secreto MFA en la base de datos
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error interno al crear el usuario' });
  }
};

const iniciarSesionUsuario = async (req, res) => {
  const { Correo, Contraseña, tokenMFA } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { Correo } });

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
        usuario.bloqueadoHasta = Date.now() + 1 * 60 * 1000;
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

    if (usuario.secret_mfa) {
      const tokenValido = speakeasy.totp.verify({
        secret: usuario.secret_mfa,
        encoding: 'base32',
        token: tokenMFA,
      });

      if (!tokenValido) {
        return res.status(401).json({ message: 'Token MFA inválido.' });
      }
    }

    const id_sesion = generarIdSesion();
    usuario.id_sesion = id_sesion;
    await usuario.save();

    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      id_usuario: usuario.id_usuarios,
    });
    
  } catch (error) {
    console.error('Error al iniciar sesión del usuario:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesión.' });
  }
};

// Función para generar el código QR y el secret para MFA
const generarMFAQR = async (req, res) => {
  const id_usuarios = req.params.id_usuarios;

  try {
    const usuario = await Usuario.findByPk(id_usuarios);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const secret = speakeasy.generateSecret({
      name: 'TuApp (Usuario)',
    });

    usuario.MFA = secret.base32; // Guardar en el campo correcto
    await usuario.save();

    QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
      if (err) {
        console.error('Error al generar el código QR:', err);
        return res.status(500).json({ message: 'Error interno al generar el código QR.' });
      }
      res.status(200).json({ qrCode: dataUrl });
    });
  } catch (error) {
    console.error('Error al generar MFA:', error);
    res.status(500).json({ message: 'Error interno al generar MFA.' });
  }
};


// Función para verificar el token MFA
const verificarTokenMFA = async (req, res) => {
  const id_usuarios = req.params.id_usuarios; 
  const { token } = req.body;

  try {
    const usuario = await Usuario.findByPk(id_usuarios);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const secret = usuario.MFA;

    if (!secret) {
      return res.status(400).json({ message: 'MFA no configurado para este usuario.' });
    }

    const tokenValido = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
    });

    if (tokenValido) {
      res.status(200).json({ message: 'Autenticación MFA exitosa.' });
    } else {
      res.status(401).json({ message: 'Token MFA inválido.' });
    }
  } catch (error) {
    console.error('Error al verificar MFA:', error);
    res.status(500).json({ message: 'Error interno al verificar MFA.' });
  }
};


const eliminarUsuario = async (req, res) => {
  const id_usuarios = req.params.id_usuarios; // Cambiar a id_usuarios

  try {
    await FrecuenciaBloqueosUsuarios.destroy({ where: { id_usuario: id_usuarios } });

    const usuario = await Usuario.findByPk(id_usuarios);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar al usuario:', error.message);
    res.status(500).json({ message: 'Error interno al eliminar al usuario' });
  }
};

const cambiarRolUsuario = async (req, res) => {
  const id_usuarios = req.params.id_usuarios; // Cambiar a id_usuarios
  const { nuevoTipoUsuario } = req.body;

  try {
    const usuario = await Usuario.findByPk(id_usuarios);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (!nuevoTipoUsuario) {
      return res.status(400).json({ message: 'El nuevo tipo de usuario es requerido.' });
    }

    const nuevoTrabajador = await Trabajador.create({
      Nombre: usuario.Nombre,
      Apellido_Paterno: usuario.Apellido_Paterno,
      Apellido_Materno: usuario.Apellido_Materno,
      Edad: usuario.Edad,
      Genero: usuario.Genero,
      Correo: usuario.Correo,
      Telefono: usuario.Telefono,
      Contraseña: usuario.Contraseña,
      Intentos_contraseña: usuario.Intentos_contraseña,
      id_sesion: usuario.id_sesion,
      id_tipo_trabajador: nuevoTipoUsuario,
      MFA: usuario.MFA
    });

    await usuario.destroy();
    res.status(201).json(nuevoTrabajador);
  } catch (error) {
    console.error('Error al cambiar rol del usuario:', error);
    res.status(500).json({ message: 'Error interno al cambiar el rol del usuario' });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  iniciarSesionUsuario,
  eliminarUsuario,
  cambiarRolUsuario,
  generarMFAQR, 
  verificarTokenMFA, 
};
