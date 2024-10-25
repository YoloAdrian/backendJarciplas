require('dotenv').config();
const nodemailer = require('nodemailer');
const Usuario = require('../models/usuariosModel');
const crypto = require('crypto');
const validator = require('validator'); 
const speakeasy = require('speakeasy');

const generarIdSesion = () => {
    return crypto.randomBytes(32).toString('hex');
  };


let recoveryCode; // Variable para almacenar el código de verificación
let datosUsuarioTemp; 

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'ironsafe3@gmail.com',
    pass: 'bhiu pxxu gymn xbyo', 
  },
});


const solicitarRecuperacion = async (req, res) => {
  const { email, datosUsuario } = req.body; 
  datosUsuarioTemp = datosUsuario; 

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
    from: `"Tu Nombre" <${process.env.EMAIL_USER}>`, 
    to: correo,
    subject: 'Código de verificación',
    html: `<p>Hola,</p>
           <p>Has solicitado restablecer tu contraseña. Aquí tienes tu código de verificación:</p>
           <p><strong>${recoveryCode}</strong></p>
           <p>Si no has solicitado este cambio, puedes ignorar este mensaje.</p>`,
  };

  // Envío del correo electrónico
  try {
    console.log(`Enviando correo a: ${correo}`); 
    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado exitosamente'); 
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error); 
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
  
        // Generar un nuevo ID de sesión y el secreto para MFA
        const id_sesion = generarIdSesion();
        const secret = speakeasy.generateSecret({ length: 20 });
        const mfaSecret = secret.base32;
  
        // Crear el nuevo usuario en la base de datos
        const nuevoUsuario = await Usuario.create({
          Nombre: sanitizedNombre,
          Apellido_Paterno: sanitizedApellidoPaterno,
          Apellido_Materno: sanitizedApellidoMaterno,
          Edad: datosUsuario.Edad,
          Genero: datosUsuario.Genero,
          Correo: sanitizedCorreo,
          Telefono: sanitizedTelefono,
          Contraseña: datosUsuario.Contraseña, 
          Intentos_contraseña: 0,
          id_sesion,
          id_tipo_usuario: datosUsuario.id_tipo_usuario, 
          MFA: mfaSecret
        });
  
       
        recoveryCode = null; 
        return res.json({ message: 'Código verificado correctamente. Usuario creado.', usuario: nuevoUsuario });
      } else {
        return res.status(400).json({ message: 'Código incorrecto. Intenta de nuevo.' });
      }
    } catch (error) {
      console.error('Error al verificar el código y guardar el usuario:', error);
      return res.status(500).json({ message: 'Error en la verificación. Intenta de nuevo.' });
    }
  };
  

module.exports = { solicitarRecuperacion, verificarCodigo };
