const express = require('express');
const router = express.Router();
const hal = require('hal');
const halson = require('halson');
const usuarioController = require('../Controller/usuarioController.js');
const { check, validationResult } = require('express-validator');

// RUTA para consultar UN usuario por ID (ej: /usuarios/1)
router.get('/:id', usuarioController.consultarUsuarioPorId);

// RUTA para consultar TODOS los usuarios (ej: /usuarios)
router.get('/', usuarioController.consultarUsuario);

// Validaciones para la creación de usuario
router.post(
    '/',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('correo', 'El correo no es válido').isEmail(),
        check('contrasena', 'La contraseña debe tener mínimo 6 caracteres').isLength({ min: 6 }),
        check('rol', 'El rol es obligatorio').not().isEmpty()
    ],
    (req, res, next) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }
        usuarioController.agregarUsuario(req, res, next);
    }
);

// RUTA para modificar un usuario
router.put('/:id', usuarioController.modificarUsuario);

// RUTA para eliminar un usuario
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
