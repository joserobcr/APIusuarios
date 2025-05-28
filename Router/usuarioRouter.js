const express = require('express');
const router = express.Router();
const { check, query, validationResult } = require('express-validator');
const usuarioController = require('../Controller/usuarioController');

// Obtener todos los usuarios o uno por ID (query param)
router.get('/',
  query('id_usuario').optional().isInt().withMessage('El ID debe ser un número entero'),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    if(req.query.id_usuario) {
        usuarioController.consultarUsuarioPorId(req, res, next);
    }
    else {
        usuarioController.consultarUsuario(req, res, next);
    }
  }
);

// Crear un nuevo usuario
router.post('/',
  [
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('correo', 'El correo no es válido').isEmail(),
    check('contrasena', 'La contraseña debe tener mínimo 6 caracteres').isLength({ min: 6 }),
    check('rol', 'El rol es obligatorio').notEmpty()
  ],
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    usuarioController.agregarUsuario(req, res, next);
  }
);

// Actualizar usuario por ID (query param)
router.put('/',
  [
    query('id_usuario', 'ID inválido').isInt(),
    check('nombre').optional().notEmpty().withMessage('El nombre no debe estar vacío'),
    check('correo').optional().isEmail().withMessage('Correo inválido'),
    check('contrasena').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
    check('rol').optional().notEmpty().withMessage('El rol no debe estar vacío')
  ],
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    usuarioController.modificarUsuario(req, res, next);
  }
);

// Eliminar usuario por ID (query param)
router.delete('/',
  query('id_usuario', 'ID inválido').isInt(),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    usuarioController.eliminarUsuario(req, res, next);
  }
);

module.exports = router;

