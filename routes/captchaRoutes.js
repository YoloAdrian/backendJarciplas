const express = require('express');
const router = express.Router();
const captchaController = require('../controllers/captcha');

router.post('/verificar_captcha', captchaController.verificarCaptcha);


module.exports = router;