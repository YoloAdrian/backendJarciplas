const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const Usuario = require('../models/usuariosModel'); 
const Trabajador = require('../models/trabajadoresModel'); 

// Función para generar el código QR y el secret para MFA
const generarMFAQR = async (req, res) => {
  const { tipo, id } = req.params; 

  try {
    // Generar el secret único para MFA
    const secret = speakeasy.generateSecret({
      name: tipo === 'usuario' ? 'TuApp (Usuario)' : 'TuApp (Trabajador)'
    });

    let entidad;

    if (tipo === 'usuario') {
      entidad = await Usuario.findByPk(id);
    } else if (tipo === 'trabajador') {
      entidad = await Trabajador.findByPk(id);
    }

    if (!entidad) {
      return res.status(404).json({ message: `${tipo} no encontrado.` });
    }

    // Guardar el secret en la base de datos 
    entidad.secret_mfa = secret.base32;
    await entidad.save();

    // Generar el código QR
    QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
      if (err) {
        console.error('Error al generar el código QR:', err);
        return res.status(500).json({ message: 'Error interno al generar el código QR.' });
      }
      // Retornar el código QR para que el frontend lo muestre
      res.status(200).json({ qrCode: dataUrl });
    });
  } catch (error) {
    console.error('Error al generar MFA:', error);
    res.status(500).json({ message: 'Error interno al generar MFA.' });
  }
};

// Función para verificar el token MFA
const verificarTokenMFA = async (req, res) => {
  const { tipo, id } = req.params;
  const { token } = req.body;

  try {
    let entidad;

    if (tipo === 'usuario') {
      entidad = await Usuario.findByPk(id);
    } else if (tipo === 'trabajador') {
      entidad = await Trabajador.findByPk(id);
    }

    if (!entidad) {
      return res.status(404).json({ message: `${tipo} no encontrado.` });
    }

    // Obtener el secret desde la base de datos
    const secret = entidad.secret_mfa;

    if (!secret) {
      return res.status(400).json({ message: 'MFA no configurado para este usuario.' });
    }

    // Verificar el token
    const tokenValido = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
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
  generarMFAQR,
  verificarTokenMFA,
};
