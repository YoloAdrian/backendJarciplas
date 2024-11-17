const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Configuracion = sequelize.define('tbl_configuracion', {
  id_configuracion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  cantidad_errores: {
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
}, {
  timestamps: false,
  tableName: 'tbl_configuracion'
});

module.exports = Configuracion;
