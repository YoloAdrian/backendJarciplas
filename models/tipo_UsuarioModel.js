const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TipoUsuario = sequelize.define('TipoUsuario', {
  id_tipo_usuarios: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Usuario: { // Cambiado a "Usuario" como nombre de campo
    type: DataTypes.STRING(30),
    allowNull: false,
  },
}, {
  tableName: 'tbl_tipo_usuarios', // Asegúrate de que coincida con el nombre de la tabla
  timestamps: false,
});

// Sincroniza el modelo con la base de datos (opcional)
TipoUsuario.sync()


module.exports = TipoUsuario;



