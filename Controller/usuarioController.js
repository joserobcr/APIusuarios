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
  const { id } = req.params;
  const { nombre, correo, contrasena, rol } = req.body;
  try {
    const [resultado] = await db.query(
      'UPDATE usuarios SET nombre = ?, correo = ?, contrasena = ?, rol = ? WHERE id_usuario = ?',
      [nombre, correo, contrasena, rol, id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
