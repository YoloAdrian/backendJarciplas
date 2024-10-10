const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
  id_usuarios: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Nombre: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  Apellido_Paterno: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  Apellido_Materno: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  Edad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Genero: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  Correo: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  Telefono: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Contraseña: {
    type: DataTypes.STRING(18),
    allowNull: false,
  },
}, {
  tableName: 'tbl_usuarios',
  timestamps: false,
});

module.exports = Usuario;
