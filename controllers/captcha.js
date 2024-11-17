const axios = require('axios');

const verificarCaptcha = async (req, res) => {
  const { captchaToken } = req.body;

  
  const secretKey = '6Ld-o2AqAAAAAKA-_GSvi9OYUMCox_x2Cojr9lYI';

  try {
    // Hacer la solicitud a la API de reCAPTCHA para verificar el token
    const respuesta = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: secretKey,
        response: captchaToken,
      },
    });

    const { success } = respuesta.data;

    // Responder al frontend con el resultado de la verificación
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Verificación de reCAPTCHA fallida.' });
    }
  } catch (error) {
    console.error('Error al verificar el reCAPTCHA:', error);
    res.status(500).json({ message: 'Error interno al verificar el reCAPTCHA' });
  }
};

module.exports = {
  verificarCaptcha,
};
