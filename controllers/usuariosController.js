const axios = require('axios');
const Usuario = require('../models/usuariosModel');
const TipoUsuario = require('../models/tipo_UsuarioModel');
const crypto = require('crypto');
const FrecuenciaBloqueosUsuarios = require('../models/frecuenciaBloqueosUsuariosModel');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const validator = require('validator');
const Configuracion = require('../models/configuracionModel');
const bcrypt = require('bcrypt'); // Importar bcrypt para el hashing de contraseñas


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
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el usuario' });
  }
};

const crearUsuario = async (req, res) => {
  const { Nombre, Apellido_Paterno, Apellido_Materno, Edad, Genero, Correo, Telefono, Contraseña, id_tipo_usuario } = req.body;

  try {
    if (!Nombre || !Apellido_Paterno || !Apellido_Materno || !Edad || !Genero || !Correo || !Telefono || !Contraseña || !id_tipo_usuario) {
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

    // Hash de la contraseña
    const saltRounds = 10; // Puedes ajustar esto según la seguridad deseada
    const hashedContraseña = await bcrypt.hash(Contraseña, saltRounds);


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
      Nombre: sanitizedNombre,
      Apellido_Paterno: sanitizedApellidoPaterno,
      Apellido_Materno: sanitizedApellidoMaterno,
      Edad,
      Genero,
      Correo: sanitizedCorreo,
      Telefono: sanitizedTelefono,
      Contraseña: hashedContraseña, // Guarda la contraseña hasheada
      Contraseña: hashedContraseña, // Guarda la contraseña hasheada
      Intentos_contraseña: 0,
      id_sesion,
      id_tipo_usuario,
      MFA: mfaSecret
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error interno al crear el usuario' });
  }
};

const iniciarSesionUsuario = async (req, res) => {
  const { Correo, Contraseña } = req.body; // Elimina `tokenMFA`

  try {
    // Obtener la cantidad de errores permitidos desde la configuración
    const configuracion = await Configuracion.findByPk(1);
    if (!configuracion) {
      return res.status(500).json({ message: 'Error de configuración no disponible.' });
    }

    const cantidadErroresPermitidos = configuracion.cantidad_errores;

    // Buscar el usuario por correo
    const usuario = await Usuario.findOne({ where: { Correo } });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Verificar si la cuenta está bloqueada
    if (usuario.Intentos_contraseña >= cantidadErroresPermitidos) {
      const tiempoBloqueoRestante = usuario.bloqueadoHasta - Date.now();

      if (tiempoBloqueoRestante > 0) {
        const segundosRestantes = Math.floor(tiempoBloqueoRestante / 1000);
        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta de nuevo en ${segundosRestantes} segundos.`,
        });
      } else {
        // Restablecer el contador de intentos y desbloquear la cuenta
        usuario.Intentos_contraseña = 0;
        usuario.bloqueadoHasta = null;
        await usuario.save();
      }
    }

    // Comparar la contraseña ingresada con la almacenada
    const esCoincidente = await bcrypt.compare(Contraseña, usuario.Contraseña); // usuario.Contraseña es el hash
    console.log('Contraseña ingresada:', Contraseña);
    console.log('Contraseña almacenada (hash):', usuario.Contraseña);
    console.log('¿Contraseña válida?', esCoincidente);

    if (!esCoincidente) {
      console.log('La contraseña no coincide, incrementando intentos.');
      usuario.Intentos_contraseña += 1;
      if (usuario.Intentos_contraseña >= cantidadErroresPermitidos) {
        console.log('Cuenta bloqueada temporalmente.');
        usuario.bloqueadoHasta = Date.now() + 5 * 60 * 1000; // Bloquear por 5 minutos
      }
      await usuario.save();
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    console.log('Usuario autenticado correctamente. Continuando...');

    // Restablecer intentos y proceder con el inicio de sesión exitoso
    usuario.Intentos_contraseña = 0;
    usuario.bloqueadoHasta = null;

    const id_sesion = generarIdSesion();
    usuario.id_sesion = id_sesion;
    await usuario.save();

    res.cookie('id_sesion', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      id_usuario: usuario.id_usuarios,
    });

  } catch (error) {
    console.error('Error al iniciar sesión del usuario:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesión.' });
  }
};


const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error interno al eliminar el usuario' });
  }
};


const cambiarRolUsuario = async (req, res) => {
  const { id_usuarios } = req.params;
  const { id_tipo_usuario } = req.body;

  try {
    // Buscar el usuario por ID
    const usuario = await Usuario.findByPk(id_usuarios);
    if (!usuario) {
      console.log(`Usuario con ID ${id_usuarios} no encontrado en la base de datos.`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si el nuevo rol no es usuario, solo se actualiza el rol
    if (id_tipo_usuario !== 1) {
      usuario.id_tipo_usuario = id_tipo_usuario;
      await usuario.save();
      return res.status(200).json(usuario);
    }

    // Si el nuevo rol es usuario, migramos el usuario a la tabla de usuarioes
    const nuevousuario = await usuario.create({
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
      id_tipo_usuario: 1, // Tipo de usuario
      MFA: usuario.MFA
    });

    // Una vez creado el usuario, eliminamos el usuario de la tabla usuarios
    await usuario.destroy();

    console.log('Usuario migrado a usuario:', nuevousuario);
    res.status(201).json(nuevousuario);
  } catch (error) {
    console.error('Error al cambiar el rol del usuario:', error);
    res.status(500).json({ message: 'Error interno al cambiar el rol del usuario' });
  }
};

// Función para generar el código QR y el secret para MFA
const generarMFAQR = async (req, res) => {
  const id_usuarios = req.params.id_usuarios;
  console.log('Recibida solicitud para generar MFA para usuario con ID:', id_usuarios); // Log inicial

  try {
    // Buscar el usuario por ID
    const usuario = await Usuario.findByPk(id_usuarios);
    console.log('Usuario encontrado:', usuario ? usuario.Correo : 'No encontrado'); // Log del usuario

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Generar un secreto para el usuario
    const secret = speakeasy.generateSecret({
      name: `TuApp (usuario)`,
    });
    console.log('Secreto generado:', secret); // Log del secreto generado

    // Guardar el secreto en la base de datos
    usuario.MFA = secret.base32;
    await usuario.save();
    console.log('Secreto MFA guardado para el usuario:', usuario.Correo); // Confirmación de guardado

    // Generar el QR
    QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
      if (err) {
        console.error('Error al generar el código QR:', err);
        return res.status(500).json({ message: 'Error interno al generar el código QR.' });
      }

      console.log('Código QR generado correctamente para el usuario:', usuario.Correo); // Confirmación del QR
      res.status(200).json({
        qr: dataUrl,
        secret: secret.base32,
      });
    });
  } catch (error) {
    console.error('Error al generar QR MFA:', error); // Log de errores
    res.status(500).json({ message: 'Error interno al generar QR MFA.' });
  }
};

// Función para verificar el token MFA
const verificarTokenMFA = async (req, res) => {
  const id_usuario = req.params.id_usuarios; 
  const { token } = req.body;

  try {
    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: 'usuario no encontrado.' });
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

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  iniciarSesionUsuario,
  eliminarUsuario,
  cambiarRolUsuario,
  generarMFAQR,
  verificarTokenMFA,
  generarMFAQR,
  verificarTokenMFA,
};

