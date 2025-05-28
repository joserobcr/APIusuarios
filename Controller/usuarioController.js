require('dotenv').config();
const mysql = require('mysql2/promise');
const { body, param, validationResult } = require('express-validator');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

exports.consultarUsuario = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.consultarUsuarioPorId = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const id = req.query.id_usuario;

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', id);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

exports.agregarUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  try {
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, contrasena, rol]
    );
    res.status(201).json({ mensaje: 'Usuario creado', id: resultado.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

exports.modificarUsuario = async (req, res) => {
  const id = req.query.id_usuario;  // cambio aquí
  const { nombre, correo, contrasena, rol } = req.body;

  try {
    // Aquí solo actualizamos los campos que llegan (si vienen undefined no los ponemos)
    // Para evitar poner campos undefined, construimos dinámicamente:
    let campos = [];
    let valores = [];

    if (nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (correo !== undefined) {
      campos.push('correo = ?');
      valores.push(correo);
    }
    if (contrasena !== undefined) {
      campos.push('contrasena = ?');
      valores.push(contrasena);
    }
    if (rol !== undefined) {
      campos.push('rol = ?');
      valores.push(rol);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
    }

    valores.push(id); // para el WHERE

    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id_usuario = ?`;

    const [resultado] = await db.query(sql, valores);

    if (resultado.affectedRows === 0)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ mensaje: 'Usuario actualizado' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

exports.eliminarUsuario = async (req, res) => {
  const id = req.query.id_usuario;  // cambio aquí
  try {
    const [resultado] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

    if (resultado.affectedRows === 0)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ mensaje: 'Usuario eliminado' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

