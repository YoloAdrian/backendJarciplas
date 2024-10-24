const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Terminos = sequelize.define('Terminos', {
  id_terminos: {
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
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_vigencia: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('vigente', 'no vigente', 'eliminada'),
    allowNull: false,
    defaultValue: 'vigente'
  },
  fecha_eliminacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'tbl_terminos',
  timestamps: false
});

module.exports = Terminos;
