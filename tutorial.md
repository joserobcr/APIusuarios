# Tutorial: API REST básica con Express

Este tutorial te guiará para ejecutar y probar una API REST sencilla construida con Express. La API responde con "Hello World" al acceder a la ruta raíz.

## Requisitos

- Node.js instalado en tu sistema.
- npm (Node Package Manager).

## Instalación

1. Abre una terminal y navega al directorio del proyecto:

   ```sh
   cd "c:\Users\joser\API Rest\API-Rest-1\Parcial2\Bearertoken"
   ```

2. Instala las dependencias necesarias:

   ```sh
   npm install express
   ```

## Ejecución del servidor

Inicia el servidor ejecutando el siguiente comando en la terminal:

```sh
node index.js
```

Deberías ver un mensaje como:

```
Server is running on http://localhost:3000
```

## Probar la API

Abre tu navegador o usa una herramienta como `curl` o Postman y realiza una petición GET a la ruta raíz:

- **URL:** [http://localhost:3000/](http://localhost:3000/)

Deberías recibir la siguiente respuesta:

```
Hello World
```

## Estructura del proyecto

- `index.js`: Archivo principal donde se configura y ejecuta el servidor Express.

## Personalización

Puedes modificar la respuesta o agregar nuevas rutas editando el archivo `index.js`.

---

¡Listo! Ahora tienes una API REST básica corriendo en tu máquina local.
