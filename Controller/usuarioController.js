require('dotenv').config();
const mysql = require('mysql2');
const halson = require('halson');

const connection = mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Obtener todos los usuarios
function consultarUsuario(req, res) {
    const consulta = 'SELECT * FROM usuarios';

    connection.query(consulta, [], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor', detalle: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron usuarios' });
        }

        

        return res.json({ usuarios });
    });
}

// Obtener usuario por ID
function consultarUsuarioPorId(req, res) {
    const id_usuario = req.params.id;
    const consulta = 'SELECT * FROM usuarios WHERE idUsuario = ?';

    connection.query(consulta, [id_usuario], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor', detalle: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const user = results[0];

       

        res.json(usuario);
    });
}


// Agregar nuevo usuario
function agregarUsuario(req, res) {
    const { nombre, correo, contrasena, rol, activo } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, incluyendo el estado activo/inactivo." });
    }

    const consulta = `INSERT INTO usuarios (nombre, correo, contrasena, rol, activo) VALUES (?, ?, ?, ?, ?)`;

    connection.query(consulta, [nombre, correo, contrasena, rol, activo], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error en el servidor", detalle: err.message });
        }

        const estadoMensaje = activo ? "El usuario está activo" : "El usuario está inactivo";

        const usuario = halson({
            mensaje: "Usuario creado exitosamente",
            idUsuario: results.insertId,
            estado: estadoMensaje
        })
        .addLink('self', `/usuarios/${results.insertId}`)
        .addLink('editar', `/usuarios/${results.insertId}`)
        .addLink('eliminar', `/usuarios/${results.insertId}`);

        res.status(201).json(usuario);
    });
}

// Modificar usuario existente
function modificarUsuario(req, res) {
    const idUsuario = req.params.id;
    const { nombre, correo, contrasena, rol, activo } = req.body;

    const consulta = `UPDATE usuarios SET nombre = ?, correo = ?, contrasena = ?, rol = ?, activo = ? WHERE idUsuario = ?`;

    connection.query(consulta, [nombre, correo, contrasena, rol, activo, idUsuario], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error al actualizar el usuario", detalle: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const respuesta = halson({
            mensaje: "Usuario actualizado correctamente",
            idUsuario
        })
        .addLink('self', `/usuarios/${idUsuario}`);

        res.json(respuesta);
    });
}

// Eliminar usuario
function eliminarUsuario(req, res) {
    const id_usuario = req.params.id;
    const consulta = `DELETE FROM usuarios WHERE idUsuario = ?`;

    connection.query(consulta, [id_usuario], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error al eliminar el usuario", detalle: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const respuesta = halson({
            mensaje: "Usuario eliminado correctamente",
            id_usuario
        });

        res.json(respuesta);
    });
}

module.exports = {
    consultarUsuario,
    consultarUsuarioPorId,
    agregarUsuario,
    modificarUsuario,
    eliminarUsuario
};
