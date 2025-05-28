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
  origin: 'http://apiusuarios-production-c528.up.railway.app',
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
        url: "http://apiusuarios-production-c528.up.railway.app",
        description: "Servidor local de desarrollo"
      }
    ],
    paths: {
      "/usuarios": {
        get: {
          summary: "Consultar usuarios",
          description: "Devuelve todos los usuarios o uno específico si se proporciona un ID.",
          parameters: [
            {
              name: "id_usuario",
              in: "query",
              description: "ID del usuario a buscar (opcional)",
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
                                id: { type: "integer" },
                                nombre: { type: "string" },
                                correo: { type: "string" },
                                contrasena: { type: "string" },
                                rol: { type: "string" },
                                _links: {
                                  type: "object",
                                  properties: {
                                    self: { type: "string", example: "/usuarios/1" },
                                    editar: { type: "string", example: "/usuarios/1/editar" },
                                    eliminar: { type: "string", example: "/usuarios/1/eliminar" }
                                  }
                                }
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
            },
            "500": { description: "Error interno del servidor" }
          },
          "x-codeSamples": [
            {
              lang: "javascript",
              label: "JavaScript",
              source: "fetch('http://localhost:3001/usuarios')\n  .then(response => response.json())\n  .then(data => console.log(data));"
            },
            {
              lang: "python",
              label: "Python",
              source: "import http.client\n\nconn = http.client.HTTPConnection(\"localhost\", 3001)\nconn.request(\"GET\", \"/usuarios\")\nresponse = conn.getresponse()\nprint(response.read().decode())"
            }
          ]
        },
        post: {
          summary: "Crear un usuario",
          description: "Registra un nuevo usuario en la base de datos.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nombre: { type: "string" },
                    correo: { type: "string" },
                    contrasena: { type: "string" },
                    rol: { type: "string" }
                  },
                  required: ["nombre", "correo", "contrasena", "rol"]
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Usuario creado exitosamente",
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
            "400": { description: "Datos inválidos" },
            "500": { description: "Error interno del servidor" }
          },
          "x-codeSamples": [
            {
              lang: "javascript",
              label: "JavaScript",
              source: "fetch('http://localhost:3001/usuarios', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ nombre: 'Juan', correo: 'juan@mail.com', contrasena: '1234', rol: 'alumno' })\n})\n.then(response => response.json())\n.then(data => console.log(data));"
            },
            {
              lang: "python",
              label: "Python",
              source: "import http.client\nimport json\n\nconn = http.client.HTTPConnection(\"localhost\", 3001)\npayload = json.dumps({\"nombre\": \"Juan\", \"correo\": \"juan@mail.com\", \"contrasena\": \"1234\", \"rol\": \"alumno\"})\nheaders = {'Content-Type': 'application/json'}\nconn.request(\"POST\", \"/usuarios\", payload, headers)\nres = conn.getresponse()\ndata = res.read()\nprint(data.decode(\"utf-8\"))"
            }
          ]
        },
        put: {
          summary: "Actualizar usuario",
          description: "Actualiza los datos de un usuario existente.",
          parameters: [
            {
              name: "id_usuario",
              in: "query",
              description: "ID del usuario a actualizar",
              required: true,
              schema: { type: "integer", example: 1 }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nombre: { type: "string" },
                    correo: { type: "string" },
                    contrasena: { type: "string" },
                    rol: { type: "string" }
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
            "404": { description: "Usuario no encontrado" },
            "500": { description: "Error interno del servidor" }
          },
          "x-codeSamples": [
            {
              lang: "javascript",
              label: "JavaScript",
              source: "fetch('http://localhost:3001/usuarios?id=1', {\n  method: 'PUT',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ nombre: 'Nuevo nombre', correo: 'nuevo@mail.com', contrasena: 'abcd', rol: 'alumno' })\n})\n.then(response => response.json())\n.then(data => console.log(data));"
            },
            {
              lang: "python",
              label: "Python",
              source: "import http.client\nimport json\n\nconn = http.client.HTTPConnection(\"localhost\", 3001)\npayload = json.dumps({\"nombre\": \"Nuevo nombre\", \"correo\": \"nuevo@mail.com\", \"contrasena\": \"abcd\", \"rol\": \"alumno\"})\nheaders = {'Content-Type': 'application/json'}\nconn.request(\"PUT\", \"/usuarios?id=1\", payload, headers)\nres = conn.getresponse()\ndata = res.read()\nprint(data.decode(\"utf-8\"))"
            }
          ]
        },
        delete: {
          summary: "Eliminar un usuario",
          description: "Elimina un usuario por ID.",
          parameters: [
            {
              name: "id_usuario",
              in: "query",
              description: "ID del usuario a eliminar",
              required: true,
              schema: { type: "integer", example: 1 }
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
            "404": { description: "Usuario no encontrado" },
            "500": { description: "Error interno del servidor" }
          },
          "x-codeSamples": [
            {
              lang: "javascript",
              label: "JavaScript",
              source: "fetch('http://localhost:3001/usuarios?id=1', {\n  method: 'DELETE'\n})\n.then(response => response.json())\n.then(data => console.log(data));"
            },
            {
              lang: "python",
              label: "Python",
              source: "import http.client\n\nconn = http.client.HTTPConnection(\"localhost\", 3001)\nconn.request(\"DELETE\", \"/usuarios?id=1\")\nresponse = conn.getresponse()\nprint(response.read().decode())"
            }
          ]
        }
      }
    }
  },
  apis: [] // Puedes usar archivos separados y documentar con comentarios Swagger si lo deseas
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
