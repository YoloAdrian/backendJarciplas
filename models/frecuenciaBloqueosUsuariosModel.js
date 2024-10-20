const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./usuariosModel');

const FrecuenciaBloqueo = sequelize.define('FrecuenciaBloqueo', {
  id_bloqueos: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuarios',
    },
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'tbl_frecuencia_bloqueos_usuarios',
  timestamps: false,
});

module.exports = FrecuenciaBloqueo;
