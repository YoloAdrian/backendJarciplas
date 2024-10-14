const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const TipoTrabajador = require('./tipo_trabajadorModel');


const Trabajador = sequelize.define('Trabajador', {
  id_trabajador: {
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
  Correo: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_tipo_trabajador: {
    type: DataTypes.INTEGER,
    references: {
      model: TipoTrabajador,
      key: 'id_trabajadores',
    },
  },
  Contraseña: {
    type: DataTypes.STRING(18),
    allowNull: false,
  },
}, {
  tableName: 'tbl_trabajadores',
  timestamps: false,
});

module.exports = Trabajador;
