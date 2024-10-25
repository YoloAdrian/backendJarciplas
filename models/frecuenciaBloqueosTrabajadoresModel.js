const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Trabajador = require('./trabajadoresModel');
const FrecuenciaBloqueoTrabajadores = sequelize.define('FrecuenciaBloqueoTrabajadores', {
  id_bloqueos: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  id_trabajadores: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Trabajador,
      key: 'id_trabajador',
    },
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'tbl_frecuencia_bloqueos_trabajadores',
  timestamps: false,
});

module.exports = FrecuenciaBloqueoTrabajadores;

