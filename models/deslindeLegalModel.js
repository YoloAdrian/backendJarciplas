const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DeslindeLegal = sequelize.define('DeslindeLegal', {
  id_deslinde_legal: {
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
    allowNull: false
  }
}, {
  tableName: 'tbl_deslinde_legal',
  timestamps: false
});

module.exports = DeslindeLegal;
