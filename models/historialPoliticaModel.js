const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HistorialPolitica = sequelize.define('HistorialPolitica', {
  id_historial_politica: {
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
    allowNull: false
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_eliminacion: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'tbl_historial_politica_privacidad',
  timestamps: false
});

module.exports = HistorialPolitica;
