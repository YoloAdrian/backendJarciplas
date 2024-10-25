const axios = require('axios');
const Trabajador = require('../models/trabajadoresModel');
const Usuario = require('../models/usuariosModel');
const FrecuenciaBloqueos = require('../models/frecuenciaBloqueosTrabajadoresModel');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const validator = require('validator');
const Configuracion = require('../models/configuracionModel'); 

const generarIdSesion = () => {
  return crypto.randomBytes(32).toString('hex');
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

const obtenerTrabajadorPorId = async (req, res) => {
  try {
    const trabajador = await Trabajador.findByPk(req.params.id);
    if (!trabajador) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }
    res.status(200).json(trabajador);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el trabajador' });
  }
};

const crearTrabajador = async (req, res) => {
  const { Nombre, Apellido_Paterno, Apellido_Materno, Correo, Telefono, id_tipo_trabajador, Contraseña, Edad, Genero } = req.body;

  try {
    if (!Nombre || !Apellido_Paterno || !Apellido_Materno || !Correo || !Telefono || !id_tipo_trabajador || !Contraseña || Edad === undefined || !Genero) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Sanitización y validación de entradas
    const sanitizedNombre = validator.escape(Nombre);
    const sanitizedApellidoPaterno = validator.escape(Apellido_Paterno);
    const sanitizedApellidoMaterno = validator.escape(Apellido_Materno);
    const sanitizedCorreo = validator.normalizeEmail(Correo);
    const sanitizedTelefono = validator.escape(String(Telefono));

    if (!validator.isEmail(sanitizedCorreo)) {
      return res.status(400).json({ message: 'Correo electrónico no válido.' });
    }

    const id_sesion = generarIdSesion();
    const secret = speakeasy.generateSecret({ length: 20 });
    const mfaSecret = secret.base32;

    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    const nuevoTrabajador = await Trabajador.create({
      Nombre: sanitizedNombre,
      Apellido_Paterno: sanitizedApellidoPaterno,
      Apellido_Materno: sanitizedApellidoMaterno,
      Correo: sanitizedCorreo,
      Telefono: sanitizedTelefono,
      id_tipo_trabajador,
      Contraseña,
      Intentos_contraseña: 0,
      id_sesion,
      Edad,
      Genero,
      MFA: mfaSecret
    });

    res.status(201).json(nuevoTrabajador);
  } catch (error) {
    console.error('Error al crear el trabajador:', error);
    res.status(500).json({ message: 'Error interno al crear el trabajador' });
  }
};

const iniciarSesionTrabajador = async (req, res) => {
  const { Correo, Contraseña } = req.body;

  try {
    // Obtener la cantidad de errores permitidos desde la configuración
    const configuracion = await Configuracion.findByPk(1);
    if (!configuracion) {
      return res.status(500).json({ message: 'Error de configuración no disponible.' });
    }  

    const cantidadErroresPermitidos = configuracion.cantidad_errores;

    // Buscar el trabajador por correo
    const trabajador = await Trabajador.findOne({ where: { Correo } });

    if (!trabajador) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Verificar si la cuenta está bloqueada
    if (trabajador.bloqueadoHasta && trabajador.Intentos_contraseña >= cantidadErroresPermitidos) {
      const tiempoBloqueoRestante = trabajador.bloqueadoHasta - Date.now();

      if (tiempoBloqueoRestante > 0) {
        const segundosRestantes = Math.floor(tiempoBloqueoRestante / 1000);
        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta de nuevo en ${segundosRestantes} segundos.`,
        });
      } else {
        // Restablecer el contador de intentos y desbloquear la cuenta
        trabajador.Intentos_contraseña = 0;
        trabajador.bloqueadoHasta = null;
        await trabajador.save();
      }
    }

    // Comparar la contraseña ingresada (se recomienda usar bcrypt)
    const contraseñaValida = trabajador.Contraseña === Contraseña; // Reemplazar esto por bcrypt.compare(Contraseña, trabajador.Contraseña) si es un hash

    if (!contraseñaValida) {
      trabajador.Intentos_contraseña += 1;

      // Bloquear cuenta si se alcanzó el límite de intentos
      if (trabajador.Intentos_contraseña >= cantidadErroresPermitidos) {
        trabajador.bloqueadoHasta = Date.now() + 5 * 60 * 1000; // Bloquear por 5 minutos
        await FrecuenciaBloqueos.create({
          id_trabajadores: trabajador.id_trabajador,
          fecha: new Date(),
        });
        await trabajador.save();
        return res.status(403).json({ message: 'Cuenta bloqueada temporalmente por intentos fallidos.' });
      }

      await trabajador.save();
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Restablecer intentos y proceder con el inicio de sesión exitoso
    trabajador.Intentos_contraseña = 0;
    trabajador.bloqueadoHasta = null;
    const id_sesion = generarIdSesion();
    trabajador.id_sesion = id_sesion;
    await trabajador.save();

    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json(trabajador);
  } catch (error) {
    console.error('Error al iniciar sesión del trabajador:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesión.' });
  }
};


const eliminarTrabajador = async (req, res) => {
  const id = req.params.id;

  try {
    await FrecuenciaBloqueos.destroy({ where: { id_trabajadores: id } });

    const trabajador = await Trabajador.findByPk(id);
    if (!trabajador) {
      return res.status(404).json({ message: 'Trabajador no encontrado' });
    }

    await trabajador.destroy();
    res.status(200).json({ message: 'Trabajador eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar al trabajador:', error.message);
    res.status(500).json({ message: 'Error interno al eliminar al trabajador' });
  }
};

const cambiarRol = async (req, res) => {
  const id = req.params.id;
  const { nuevoTipoUsuario } = req.body;

  try {
    const trabajador = await Trabajador.findByPk(id);
    if (!trabajador) {
      return res.status(404).json({ message: 'Trabajador no encontrado.' });
    }

    if (!nuevoTipoUsuario) {
      return res.status(400).json({ message: 'El nuevo tipo de usuario es requerido.' });
    }

    const nuevoUsuario = await Usuario.create({
      Nombre: trabajador.Nombre,
      Apellido_Paterno: trabajador.Apellido_Paterno,
      Apellido_Materno: trabajador.Apellido_Materno,
      Edad: trabajador.Edad,
      Genero: trabajador.Genero,
      Correo: trabajador.Correo,
      Telefono: trabajador.Telefono,
      Contraseña: trabajador.Contraseña,
      Intentos_contraseña: trabajador.Intentos_contraseña,
      id_sesion: trabajador.id_sesion,
      id_tipo_usuario: trabajador.id_tipo_trabajador,
      MFA: trabajador.MFA
    });

    await trabajador.destroy();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al cambiar rol del trabajador:', error);
    res.status(500).json({ message: 'Error interno al cambiar el rol del trabajador' });
  }
};

const generarMFAQR = async (req, res) => {
  const id_trabajador = req.params.id_trabajador;

  try {
    const trabajador = await Trabajador.findByPk(id_trabajador);
    if (!trabajador) {
      return res.status(404).json({ message: 'Trabajador no encontrado.' });
    }

    const secret = speakeasy.generateSecret({
      name: 'TuApp (Trabajador)',
    });

    trabajador.MFA = secret.base32; // Guardar el secreto MFA en el campo correspondiente
    await trabajador.save();

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

const verificarTokenMFA = async (req, res) => {
  const id_trabajador = req.params.id_trabajador; 
  const { token } = req.body;

  try {
    const trabajador = await Trabajador.findByPk(id_trabajador);
    if (!trabajador) {
      return res.status(404).json({ message: 'Trabajador no encontrado.' });
    }

    const secret = trabajador.MFA;

    if (!secret) {
      return res.status(400).json({ message: 'MFA no configurado para este trabajador.' });
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

module.exports = {
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
  crearTrabajador,
  iniciarSesionTrabajador,
  eliminarTrabajador,
  cambiarRol,
  generarMFAQR,
  verificarTokenMFA,
};
