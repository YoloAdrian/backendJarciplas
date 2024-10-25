const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Politica = sequelize.define('Politica', {
  id_politica: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  contenido: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Establecer la fecha de creación por defecto
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_vigencia: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('vigente', 'no vigente', 'eliminada'), // Campo para el estado del documento
    allowNull: false,
    defaultValue: 'vigente', // Establecer el estado por defecto como 'vigente'
  },
  fecha_eliminacion: {
    type: DataTypes.DATE,
    allowNull: true, // Será null mientras la política esté activa
  },
}, {
  tableName: 'tbl_politica_privacidad',
  timestamps: false
});

module.exports = Politica;

