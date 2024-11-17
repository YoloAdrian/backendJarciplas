require('dotenv').config();
const nodemailer = require('nodemailer');
const Usuario = require('../models/usuariosModel');
const crypto = require('crypto');
const validator = require('validator'); // Importar la librería validator
const speakeasy = require('speakeasy');
const bcrypt = require('bcrypt'); // Importar bcrypt
const Trabajador = require('../models/trabajadoresModel'); // Modelo para trabajadores
const tokensRecuperacion = {};

let recoveryCode; // Variable para almacenar el código de verificación


const transporter = nodemailer.createTransport({
  service: 'gmail', // Especifica el servicio de correo (en este caso, Gmail)
  auth: {
    user: 'ironsafe3@gmail.com', // Correo electrónico desde el .env
    pass: 'bhiu pxxu gymn xbyo', // Contraseña o contraseña de aplicación desde el .env
  },
});

// Controlador para solicitar la recuperación de contraseña
const solicitarRecuperacion = async (req, res) => {
  const { email, datosUsuario } = req.body; // Recibir solo el correo y almacenar los datos temporalmente
  datosUsuarioTemp = datosUsuario; // Almacenar los datos temporalmente

  try {
    const user = await Usuario.findOne({ where: { Correo: email } });

    if (user) {
      return res.status(400).json({ message: 'El usuario ya está registrado.' });
    }

    recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    await enviarCorreo(email);

    return res.json({ message: 'Código enviado exitosamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al enviar el código. Intenta de nuevo.' });
  }
};

// Función para enviar el correo electrónico
const enviarCorreo = async (correo) => {
  const mailOptions = {
    from: `"Hola" <${process.env.EMAIL_USER}>`, // Cambiar por tu email
    to: correo,
    subject: 'Código de verificación',
    html: `<p>Hola,</p>
           <p>Has solicitado realizar la verificacion de tu correo usa este token:</p>
           <p><strong>${recoveryCode}</strong></p>
           <p>Si lo no has solicitado, puedes ignorar este mensaje.</p>`,
  };

  // Envío del correo electrónico
  try {
    console.log(`Enviando correo a: ${correo}`); // Muestra a quién se envía el correo
    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado exitosamente'); // Confirma el envío
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error); // Captura y muestra el error
  }
};

// Controlador para verificar el código
const verificarCodigo = async (req, res) => {
  const { codigo, datosUsuario } = req.body;

  try {
    // Verificar si el código de recuperación es correcto
    if (recoveryCode && recoveryCode === codigo.trim()) {
      // Validar que todos los datos necesarios están presentes
      const camposRequeridos = [
        'Nombre', 
        'Apellido_Paterno', 
        'Apellido_Materno', 
        'Edad', 
        'Genero', 
        'Correo', 
        'Telefono', 
        'Contraseña', 
        'id_tipo_usuario'
      ];
      
      for (const campo of camposRequeridos) {
        if (!datosUsuario[campo]) {
          return res.status(400).json({ message: `Falta el campo: ${campo}` });
        }
      }

      // Sanitización y validación de entradas
      const sanitizedNombre = validator.escape(datosUsuario.Nombre);
      const sanitizedApellidoPaterno = validator.escape(datosUsuario.Apellido_Paterno);
      const sanitizedApellidoMaterno = validator.escape(datosUsuario.Apellido_Materno);
      const sanitizedCorreo = validator.normalizeEmail(datosUsuario.Correo);
      const sanitizedTelefono = validator.escape(String(datosUsuario.Telefono));

      if (!validator.isEmail(sanitizedCorreo)) {
        return res.status(400).json({ message: 'Correo electrónico no válido.' });
      }

      // Verificar si el correo ya está registrado
      const usuarioExistente = await Usuario.findOne({ where: { Correo: sanitizedCorreo } });
      if (usuarioExistente) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
      }

      // Encriptar la contraseña antes de almacenar
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(datosUsuario.Contraseña, saltRounds);

      // Crear el nuevo usuario
      const nuevoUsuario = await Usuario.create({
        Nombre: sanitizedNombre,
        Apellido_Paterno: sanitizedApellidoPaterno,
        Apellido_Materno: sanitizedApellidoMaterno,
        Edad: datosUsuario.Edad,
        Genero: datosUsuario.Genero,
        Correo: sanitizedCorreo,
        Telefono: sanitizedTelefono,
        Contraseña: hashedPassword,
        Intentos_contraseña: 0,
        id_tipo_usuario: datosUsuario.id_tipo_usuario,
        MFA: speakeasy.generateSecret({ length: 20 }).base32
      });

      return res.json({ message: 'Código verificado correctamente. Usuario creado.', usuario: nuevoUsuario });
    } else {
      return res.status(400).json({ message: 'Código incorrecto. Intenta de nuevo.' });
    }
  } catch (error) {
    console.error('Error al verificar el código y guardar el usuario:', error);
    return res.status(500).json({ message: 'Error en la verificación. Intenta de nuevo.' });
  }
};

const solicitarRecuperacionContrasena = async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar el correo en las tablas de usuarios y trabajadores
    const usuario = await Usuario.findOne({ where: { Correo: email } });
    const trabajador = !usuario ? await Trabajador.findOne({ where: { Correo: email } }) : null;

    if (!usuario && !trabajador) {
      return res.status(404).json({ message: 'No se encontró ningún usuario con ese correo.' });
    }

    // Generar un token único
    const token = crypto.randomBytes(20).toString('hex');
    tokensRecuperacion[email] = { token, tipo: usuario ? 'usuario' : 'trabajador', timestamp: Date.now() };

    // Enviar el correo
    await transporter.sendMail({
      from: '"Recuperación de contraseña" <ironsafe3@gmail.com>',
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Has solicitado recuperar tu contraseña.</p>
        <p>Usa el siguiente token para continuar:</p>
        <p><strong>${token}</strong></p>
        <p>Este token es válido por 15 minutos.</p>
      `,
    });

    return res.json({ message: 'Token de recuperación enviado al correo.' });
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    return res.status(500).json({ message: 'Error al procesar la solicitud. Intenta de nuevo.' });
  }
};

// Nueva función: Verificar token y cambiar la contraseña
const cambiarContrasena = async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  try {
    // Buscar el correo asociado al token
    const email = Object.keys(tokensRecuperacion).find(
      (correo) => tokensRecuperacion[correo].token === token
    );

    if (!email) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    const datosToken = tokensRecuperacion[email];

    // Verificar expiración del token (15 minutos)
    const tiempoTranscurrido = (Date.now() - datosToken.timestamp) / 1000 / 60;
    if (tiempoTranscurrido > 15) {
      delete tokensRecuperacion[email];
      return res.status(400).json({ message: 'El token ha expirado. Solicita uno nuevo.' });
    }

    // Encriptar la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nuevaContrasena, saltRounds);

    // Actualizar contraseña en la tabla correspondiente
    if (datosToken.tipo === 'usuario') {
      await Usuario.update({ Contraseña: hashedPassword }, { where: { Correo: email } });
    } else {
      await Trabajador.update({ Contraseña: hashedPassword }, { where: { Correo: email } });
    }

    // Eliminar el token usado
    delete tokensRecuperacion[email];

    return res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    return res.status(500).json({ message: 'Error al cambiar la contraseña. Intenta de nuevo.' });
  }
};


module.exports = { 
  solicitarRecuperacion, 
  verificarCodigo, 
  solicitarRecuperacionContrasena, 
  cambiarContrasena 
};
