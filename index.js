const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'VariablesDeEntorno/.env') });
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const usuariosRoutes = require('./Router/usuarioRouter.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger embebido directamente
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API de Usuarios',
    version: '1.0.0',
    description: 'API para gestionar usuarios'
  },
  servers: [
    {
      url: 'http://apiusuarios-production-c528.up.railway.app',
      description: 'Servidor local'
    }
  ],
  paths: {
    '/usuarios': {
      get: {
        summary: 'Obtener todos los usuarios',
        responses: {
          200: {
            description: 'Lista de usuarios'
          }
        }
      },
      post: {
        summary: 'Crear un usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Juan Pérez' },
                  correo: { type: 'string', example: 'juan@example.com' },
                  contrasena: { type: 'string', example: 'secreta123' },
                  rol: { type: 'string', example: 'admin' }
                },
                required: ['nombre', 'correo', 'contrasena', 'rol']
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuario creado' },
          400: { description: 'Datos inválidos' }
        }
      }
    },
    '/usuarios/{id}': {
      get: {
        summary: 'Obtener un usuario por ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Usuario encontrado' },
          404: { description: 'Usuario no encontrado' }
        }
      },
      put: {
        summary: 'Actualizar un usuario',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Carlos Gómez' },
                  correo: { type: 'string', example: 'carlos@example.com' },
                  contrasena: { type: 'string', example: 'nueva1234' },
                  rol: { type: 'string', example: 'usuario' }
                },
                required: ['nombre', 'correo', 'contrasena', 'rol']
              }
            }
          }
        },
        responses: {
          200: { description: 'Usuario actualizado' },
          404: { description: 'Usuario no encontrado' }
        }
      },
      delete: {
        summary: 'Eliminar un usuario',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Usuario eliminado' },
          404: { description: 'Usuario no encontrado' }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/usuarios', usuariosRoutes);

app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});

module.exports = app;