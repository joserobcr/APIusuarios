require('dotenv').config();
const mysql = require('mysql2');
const halson = require('halson');

const connection = mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const hal = require('hal'); 

function consultarUsuario(req, res) {
    const consulta = 'SELECT * FROM usuarios';

    connection.query(consulta, [], function (err, results) {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor', detalle: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron usuarios' });
        }

        const usuarios = results.map(user => {
            const estadoMensaje = user.activo ? "El usuario está activo" : "El usuario está inactivo";

            return halson({
                idUsuario: user.idUsuario,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.rol,
                estado: estadoMensaje
            })
            .addLink('self', `/usuarios/${user.idUsuario}`)
            .addLink('editar', `/usuarios/${user.idUsuario}`)
            .addLink('eliminar', `/usuarios/${user.idUsuario}`);
        });

        return res.json({ usuarios });
    });
}


function consultarUsuarioPorId(req, res) {
    const idUsuario = req.params.id;

    const consulta = 'SELECT * FROM usuarios WHERE idUsuario = ?';

    connection.query(consulta, [idUsuario], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor', detalle: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const user = results[0];
        const estadoMensaje = user.activo ? "El usuario está activo" : "El usuario está inactivo";

        const usuario = halson({
            idUsuario: user.idUsuario,
            nombre: user.nombre,
            correo: user.correo,
            rol: user.rol,
            estado: estadoMensaje
        })
        .addLink('self', `/usuarios/${user.idUsuario}`)
        .addLink('editar', `/usuarios/${user.idUsuario}`)
        .addLink('eliminar', `/usuarios/${user.idUsuario}`);

        res.json(usuario);
    });
}


function agregarUsuario(req, res) {
    const { nombre, correo, contrasena, rol, activo } = req.body;

    if (!nombre || !correo || !contrasena || !rol /*|| /*activo === undefined*/) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, incluyendo el estado activo/inactivo." });
    }
    
    const consulta = `INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)`;

    connection.query(consulta, [nombre, correo, contrasena, rol /*activo*/], (err, results) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({ error: "Error en el servidor" });
        }

        let estadoMensaje = activo ? "El usuario está activo" : "El usuario está inactivo";

        const usuario = halson({
            mensaje: "Usuario creado exitosamente",
            id_usuario: results.insertId,
            estado: estadoMensaje
        })
        .addLink('self', `/usuarios`)
        .addLink('editar', `/usuarios`)
        .addLink('eliminar', `/usuarios`);

        res.json(usuario);
    });
}

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
            idUsuario: idUsuario
        })
        .addLink('self', `/usuarios/${idUsuario}`);

        res.json(respuesta);
    });
}

function eliminarUsuario(req, res) {
    const idUsuario = req.params.id;

    const consulta = `DELETE FROM usuarios WHERE idUsuario = ?`;

    connection.query(consulta, [idUsuario], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error al eliminar el usuario", detalle: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const respuesta = halson({
            mensaje: "Usuario eliminado correctamente",
            idUsuario: idUsuario
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
