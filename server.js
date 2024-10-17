const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Importa el paquete cors
const cookieParser = require('cookie-parser'); // Importa el paquete cookie-parser
const sequelize = require('./config/db');

const tipoTrabajadorRoutes = require('./routes/tipo_trabajadorRoutes');
const trabajadorRoutes = require('./routes/trabajadoresRoutes');
const usuarioRoutes = require('./routes/usuariosRoutes');
const tipoInformacionEmpresa = require('./routes/tipoInformacionEmpresaRoutes');
const informacionEmpresa = require('./routes/informacionEmpresaRoutes');
const captcha = require('./routes/captchaRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para manejar CORS
app.use(cors());

// Middleware para manejar cookies
app.use(cookieParser()); // Agrega el middleware cookie-parser aquí

// Rutas
app.use('/api', tipoTrabajadorRoutes);
app.use('/api', trabajadorRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', informacionEmpresa);
app.use('/api', tipoInformacionEmpresa);
app.use('/api', captcha);

// Conexión a la base de datos
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
});

