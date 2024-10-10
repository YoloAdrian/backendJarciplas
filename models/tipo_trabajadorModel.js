const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TipoTrabajador = sequelize.define('TipoTrabajador', {
  id_trabajadores: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  trabajador: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
}, {
  tableName: 'tbl_tipo_trabajadores',
  timestamps: false,
});

// Sincroniza el modelo con la base de datos (opcional)
TipoTrabajador.sync()
  .then(() => console.log('Tabla TipoTrabajador sincronizada con éxito.'))
  .catch(err => console.error('Error al sincronizar la tabla TipoTrabajador:', err));

module.exports = TipoTrabajador;


