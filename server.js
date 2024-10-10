const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Importa el paquete cors
const sequelize = require('./config/db');

const tipoTrabajadorRoutes = require('./routes/tipo_trabajadorRoutes');
const trabajadorRoutes = require('./routes/trabajadoresRoutes');
const usuarioRoutes = require('./routes/usuariosRoutes');
const tipoInformacionEmpresa = require('./routes/tipoInformacionEmpresaRoutes');
const informacionEmpresa = require('./routes/informacionEmpresaRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use(cors()); 



// Rutas
app.use('/api', tipoTrabajadorRoutes);
app.use('/api', trabajadorRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', informacionEmpresa);
app.use('/api', tipoInformacionEmpresa);

// Conexión a la base de datos
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
});
