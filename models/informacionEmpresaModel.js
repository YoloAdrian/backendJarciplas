const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InformacionEmpresa = sequelize.define('tbl_informacion_empresa', {
  id_informacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  logo: {
    type: DataTypes.BLOB,
    allowNull: false,
  },
  eslogan: {
    type: DataTypes.STRING(200),
  },
}, {
  timestamps: false,
  tableName: 'tbl_informacion_empresa'
});

module.exports = InformacionEmpresa;
