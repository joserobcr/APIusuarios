const express = require('express');
const router = express.Router();
const hal = require('hal');
const halson = require('halson');
const usuarioController = require('../Controller/usuarioController.js');

router.get('/:id', (req, res, next) => {
    req.query.idUsuario = req.params.id;
    usuarioController.consultarUsuario(req, res, next);
});
router.get('/', usuarioController.consultarUsuario);

//router.post('/', usuarioController.agregarUsuario); 

const { check, validationResult } = require('express-validator');



// Validaciones para la ruta de creación de usuario
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

router.put('/:id', usuarioController.modificarUsuario);

// DELETE - Eliminar usuario por ID
router.delete('/:id', usuarioController.eliminarUsuario);


module.exports = router;