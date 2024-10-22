const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HistorialDeslinde = sequelize.define('HistorialDeslinde', {
  id_historial_deslinde: {
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
  tableName: 'tbl_historial_deslinde_legal',
  timestamps: false
});

module.exports = HistorialDeslinde;