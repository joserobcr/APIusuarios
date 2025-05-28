const express = require('express');
const cors = require('cors');
const xmlparser = require('express-xml-bodyparser');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, 'VariablesDeEntorno/.env') });
const winston = require('winston');
const redoc = require('redoc-express');

const app = express();

// Rutas
const routerUsuario = require('./Router/usuarioRouter.js');

// Configurar logger
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, 'logs/error.log') })
    ]
});

// Middleware para parsear el body de las peticiones
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ limit: '1mb' }));
app.use(xmlparser());
app.use(cors({
  origin: 'https://apiusuarios-production-c528.up.railway.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Configurar Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Swagger OpenAPI
const swaggerUi = require('swagger-ui-express');
const swaggerjsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Usuarios - AsesoraTEC",
      description: "Documentación de la API para gestionar usuarios en el sistema AsesoraTEC.",
      version: "1.0.0"
    },
    servers: [
      {
        url: "https://apiusuarios-production-c528.up.railway.app",
        description: "Servidor en Railway"
      }
    ],
    paths: {
      "/usuarios": {
        get: {
          tags: ["Usuarios"],
          summary: "Obtener todos los usuarios o uno específico",
          description: "Retorna todos los usuarios si no se especifica un ID, o uno solo si se proporciona.",
          parameters: [
            {
              name: "id_usuario",
              in: "query",
              description: "ID del usuario a buscar",
              required: false,
              schema: { type: "integer", example: 1 }
            }
          ],
          responses: {
            "200": {
              description: "Consulta exitosa",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      {
                        type: "object",
                        properties: {
                          usuarios: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id_usuario: { type: "integer", example: 1 },
                                nombre: { type: "string", example: "Juan Perez" },
                                correo: { type: "string", example: "juan@mail.com" },
                                contrasena: { type: "string", example: "1234" },
                                rol: { type: "string", example: "alumno" }
                              }
                            }
                          }
                        }
                      },
                      {
                        type: "object",
                        properties: {
                          mensaje: { type: "string", example: "No se encontraron resultados." }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Crear un usuario",
          description: "Registra un nuevo usuario. Todos los campos son requeridos.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nombre", "correo", "contrasena", "rol"],
                  properties: {
                    nombre: { type: "string", example: "Maria Lopez" },
                    correo: { type: "string", example: "maria@mail.com" },
                    contrasena: { type: "string", example: "abcd1234" },
                    rol: { type: "string", example: "docente" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Usuario creado correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mensaje: { type: "string", example: "Usuario creado correctamente." },
                      id: { type: "integer", example: 5 }
                    }
                  }
                }
              }
            },
            "400": { description: "Datos inválidos" }
          }
        },
        put: {
          summary: "Actualizar un usuario existente",
          description: "Actualiza los datos de un usuario usando su ID (en query).",
          parameters: [
            {
              name: "id_usuario",
              in: "query",
              required: true,
              description: "ID del usuario a actualizar",
              schema: { type: "integer", example: 2 }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nombre: { type: "string", example: "Pedro Ramírez" },
                    correo: { type: "string", example: "pedro@mail.com" },
                    contrasena: { type: "string", example: "5678" },
                    rol: { type: "string", example: "admin" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Usuario actualizado correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mensaje: { type: "string", example: "Usuario actualizado correctamente." }
                    }
                  }
                }
              }
            },
            "404": { description: "Usuario no encontrado" }
          }
        },
        delete: {
          summary: "Eliminar un usuario por ID",
          description: "Elimina un usuario de la base de datos usando su ID.",
          parameters: [
            {
              name: "id_usuario",
              in: "query",
              required: true,
              description: "ID del usuario a eliminar",
              schema: { type: "integer", example: 3 }
            }
          ],
          responses: {
            "200": {
              description: "Usuario eliminado correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mensaje: { type: "string", example: "Usuario eliminado exitosamente." }
                    }
                  }
                }
              }
            },
            "404": { description: "Usuario no encontrado" }
          }
        }
      }
    }
  },
  apis: []
};







const swaggerDocs = swaggerjsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/api-docs.json', (req, res) => { res.json(swaggerDocs) });

app.get('/api-docs', redoc({
    title: 'Documentación de la API',
    specUrl: '/api-docs.json',
    // Habilita el plugin que soporta `x-codeSamples`
    options: {
      theme: { colors: { primary: { main: '#dd5522' } } }, // opcional
      hideDownloadButton: false
    }
  }));

  

// Ruta base
app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor express contestando" });
});

// Usar rutas de usuario
app.use('/usuarios', routerUsuario);

// Middleware de errores
app.use((err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: err.message });
});

// Iniciar servidor en puerto .env o 3001 por defecto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});