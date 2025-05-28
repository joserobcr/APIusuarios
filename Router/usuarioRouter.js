const express = require('express');
const router = express.Router();
const { check, param, validationResult } = require('express-validator');
const usuarioController = require('../Controller/usuarioController');

// Obtener todos los usuarios
router.get('/', usuarioController.consultarUsuario);

// Obtener un usuario por ID
router.get('/:id',
  param('id', 'ID inválido').isInt(),
  usuarioController.consultarUsuarioPorId
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

// Actualizar usuario
router.put('/:id',
  [
    param('id', 'ID inválido').isInt(),
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

// Eliminar usuario
router.delete('/:id',
  param('id', 'ID inválido').isInt(),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    usuarioController.eliminarUsuario(req, res, next);
  }
);

module.exports = router;
