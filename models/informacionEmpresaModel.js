const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Informacion = sequelize.define('Informacion', {
  id_informacion: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_tipo_informacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  informacion: {
    type: DataTypes.STRING(15000),
    allowNull: true,
  },
}, {
  tableName: 'tbl_informacion',
  timestamps: false,
});

module.exports = Informacion;
