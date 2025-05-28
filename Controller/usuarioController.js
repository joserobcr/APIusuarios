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
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener usuario por ID
router.get('/:id',
  param('id').isInt().withMessage('ID debe ser un número entero'),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    const { id } = req.params;
    try {
      const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el usuario' });
    }
  }
);

// Crear usuario
router.post('/',
  body('nombre').isString().notEmpty().withMessage('Nombre requerido'),
  body('correo').isEmail().withMessage('Correo electrónico no válido'),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    const { nombre, correo } = req.body;
    try {
      const [resultado] = await db.query('INSERT INTO usuarios (nombre, correo) VALUES (?, ?)', [nombre, correo]);
      res.status(201).json({ mensaje: 'Usuario creado', id: resultado.insertId });
    } catch (err) {
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
);

// Actualizar usuario
router.put('/:id',
  param('id').isInt().withMessage('ID inválido'),
  body('nombre').optional().isString().notEmpty().withMessage('Nombre requerido'),
  body('correo').optional().isEmail().withMessage('Correo no válido'),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    const { id } = req.params;
    const { nombre, correo } = req.body;

    try {
      const [resultado] = await db.query('UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?', [nombre, correo, id]);
      if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ mensaje: 'Usuario actualizado' });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }
);

// Eliminar usuario
router.delete('/:id',
  param('id').isInt().withMessage('ID debe ser un número'),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    const { id } = req.params;
    try {
      const [resultado] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
      if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ mensaje: 'Usuario eliminado' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
);

module.exports = router;
