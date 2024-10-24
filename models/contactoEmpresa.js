const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contacto = sequelize.define('tbl_contacto', {
  id_contacto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  informacion: {
    type: DataTypes.STRING(90),
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'tbl_contacto'
});

module.exports = Contacto;
