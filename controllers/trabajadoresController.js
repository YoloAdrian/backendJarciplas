const Trabajador = require('../models/trabajadoresModel');
const Usuario = require('../models/usuariosModel');
const FrecuenciaBloqueos = require('../models/frecuenciaBloqueosTrabajadoresModel');
const crypto = require('crypto');

// Función para generar un ID de sesión único
const generarIdSesion = () => {
  return crypto.randomBytes(32).toString('hex'); // Genera un ID de 64 caracteres
};

const obtenerTrabajadores = async (req, res) => {
  try {
    const trabajadores = await Trabajador.findAll();
    res.json(trabajadores);
  } catch (error) {
    console.error('Error al obtener los trabajadores:', error);
    res.status(500).json({ message: 'Error interno al obtener los trabajadores' });
  }
};

// Obtener trabajador por ID
const obtenerTrabajadorPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const trabajador = await Trabajador.findByPk(id);
    if (trabajador) {
      res.json(trabajador);
    } else {
      res.status(404).json({ message: 'Trabajador no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el trabajador:', error);
    res.status(500).json({ message: 'Error interno al obtener el trabajador' });
  }
};

// Crear nuevo trabajador
const crearTrabajador = async (req, res) => {
  const { Nombre, Apellido_Paterno, Apellido_Materno, Correo, telefono, id_tipo_trabajador, Contraseña } = req.body;

  try {
    // Validar que todos los campos requeridos estén presentes
    if (!Nombre || !Apellido_Paterno || !Apellido_Materno || !Correo || !telefono || !id_tipo_trabajador || !Contraseña) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Asegurarse de que el teléfono sea tratado como una cadena
    const telefonoStr = String(telefono);

    // Generar un ID de sesión único
    const id_sesion = generarIdSesion();
    
    // Establecer la cookie de sesión con atributos de seguridad
    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // La cookie expira en 24 horas
    });

    // Crear el nuevo trabajador incluyendo 'id_sesion' e 'Intentos_contraseña'
    const nuevoTrabajador = await Trabajador.create({
      Nombre,
      Apellido_Paterno,
      Apellido_Materno,
      Correo,
      telefono: telefonoStr, // Guardar el teléfono como cadena
      id_tipo_trabajador,
      Contraseña,
      Intentos_contraseña: 0, // Inicializamos a 0 al crear un nuevo trabajador
      id_sesion // Guardamos el ID de sesión generado
    });

    res.status(201).json(nuevoTrabajador);
  } catch (error) {
    console.error('Error al crear el trabajador:', error);
    res.status(500).json({ message: 'Error interno al crear el trabajador' });
  }
};

// Iniciar sesión del trabajador
const iniciarSesionTrabajador = async (req, res) => {
  const { Correo, Contraseña } = req.body;

  try {
    const trabajador = await Trabajador.findOne({ where: { Correo: Correo } });

    // Verificar si el trabajador existe
    if (!trabajador) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Verificar si la cuenta está bloqueada
    if (trabajador.Intentos_contraseña >= 5) {
      const tiempoBloqueoRestante = trabajador.bloqueadoHasta - Date.now();

      if (tiempoBloqueoRestante > 0) {
        const segundosRestantes = Math.floor(tiempoBloqueoRestante / 1000);
        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta de nuevo en ${segundosRestantes} segundos.`,
        });
      } else {
        // Reiniciar intentos fallidos y desbloquear la cuenta
        trabajador.Intentos_contraseña = 0;
        trabajador.bloqueadoHasta = null;
        await trabajador.save();
      }
    }

    // Verificar si la contraseña es correcta
    if (trabajador.Contraseña !== Contraseña) {
      // Incrementar el contador de intentos fallidos
      trabajador.Intentos_contraseña += 1;

      // Si se alcanzan los 5 intentos fallidos, bloquear la cuenta y registrar el bloqueo
      if (trabajador.Intentos_contraseña >= 5) {
        trabajador.bloqueadoHasta = Date.now() + 1 * 60 * 1000; // Bloquear por 1 minuto
        console.log(`La cuenta del trabajador con correo ${Correo} ha sido bloqueada por 1 minuto.`);

        // Guardar el bloqueo en la tabla FrecuenciaBloqueos
        await FrecuenciaBloqueos.create({
          id_trabajadores: trabajador.id_trabajador,
          fecha: new Date(),
        });

        console.log(`Registro de bloqueo creado para el trabajador con ID ${trabajador.id_trabajador}`);
      }

      // Guardar los cambios en la base de datos
      await trabajador.save();

      console.log(`Intentos fallidos: ${trabajador.Intentos_contraseña} para el correo: ${Correo}`);
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Si la contraseña es correcta, reiniciar el contador de intentos fallidos
    trabajador.Intentos_contraseña = 0;
    trabajador.bloqueadoHasta = null;

    // Generar un nuevo ID de sesión
    const id_sesion = generarIdSesion();
    trabajador.id_sesion = id_sesion;

    // Guardar el nuevo ID de sesión y el contador reiniciado
    await trabajador.save();

    // Establecer la cookie de sesión
    res.cookie('sessionId', id_sesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // La cookie expira en 24 horas
    });

    res.status(200).json(trabajador);
  } catch (error) {
    console.error('Error al iniciar sesión del trabajador:', error);
    res.status(500).json({ message: 'Error interno al iniciar sesión.' });
  }
};

const eliminarTrabajador = async (req, res) => {
  const id = req.params.id;

  try {
    // Elimina las referencias en tbl_frecuencia_bloqueos_trabajadores
    await FrecuenciaBloqueos.destroy({ where: { id_trabajadores: id } });

    const trabajador = await Trabajador.findByPk(id);
    if (!trabajador) {
      return res.status(404).json({ message: 'Trabajador no encontrado' });
    }

    await trabajador.destroy();
    res.status(200).json({ message: 'Trabajador eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar al trabajador:', error.message);
    res.status(500).json({ message: 'Error interno al eliminar al trabajador' });
  }
};

const cambiarRol = async (req, res) => {
  const id = req.params.id;
  const { nuevoTipoUsuario } = req.body;

  try {
    const trabajador = await Trabajador.findByPk(id);
    if (!trabajador) {
      return res.status(404).json({ message: 'Trabajador no encontrado.' });
    }

    if (!nuevoTipoUsuario) {
      return res.status(400).json({ message: 'El nuevo tipo de usuario es requerido.' });
    }

    // Crear usuario con los datos del trabajador
    const nuevoUsuario = await Usuario.create({
      Nombre: trabajador.Nombre,
      Apellido_Paterno: trabajador.Apellido_Paterno,
      Apellido_Materno: trabajador.Apellido_Materno,
      Edad: trabajador.Edad,
      Genero: trabajador.Genero,
      Correo: trabajador.Correo,
      Telefono: trabajador.telefono,
      Contraseña: trabajador.Contraseña,
      Intentos_contraseña: 0,
      id_sesion: generarIdSesion(),
      id_tipo_usuario: nuevoTipoUsuario,
    });

    await trabajador.destroy();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al cambiar rol del trabajador:', error);
    res.status(500).json({ message: 'Error interno al cambiar el rol del trabajador' });
  }
};

module.exports = {
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
  crearTrabajador,
  iniciarSesionTrabajador,
  eliminarTrabajador,
  cambiarRol,
};
