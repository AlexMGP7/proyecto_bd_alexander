// Importaciones de módulos y paquetes necesarios
import { plainToClass } from "class-transformer"; // Módulo para transformar objetos planos a instancias de clase
import { validateOrReject } from "class-validator"; // Módulo para validar objetos con decoradores de clase
import dotenv from "dotenv"; // Módulo para cargar variables de entorno desde un archivo .env
import "es6-shim"; // Polyfill para añadir funcionalidades de ES6 a navegadores antiguos
import express, { Express, Request, Response } from "express"; // Framework para construir aplicaciones web
import { Pool } from "pg"; // Cliente para conectarse a PostgreSQL
import "reflect-metadata"; // Módulo para trabajar con metadatos de clases y propiedades

// Importación de clases DTO (Data Transfer Object)
import { Board } from "./dto/board.dto"; // Clase DTO para representar datos de tableros
import { User } from "./dto/user.dto"; // Clase DTO para representar datos de usuarios

// Carga de variables de entorno desde el archivo .env
dotenv.config();

// Creación de un nuevo cliente de Pool para PostgreSQL con la configuración obtenida de las variables de entorno
const pool = new Pool({
  user: process.env.DB_USER, // Usuario de la base de datos
  host: process.env.DB_HOST, // Host de la base de datos
  database: process.env.DB_NAME, // Nombre de la base de datos
  password: process.env.DB_PASS, // Contraseña de la base de datos
  port: +process.env.DB_PORT!, // Puerto de conexión a la base de datos
});

// Creación de una nueva instancia de la aplicación Express
const app: Express = express();

// Definición del puerto en el que escuchará la aplicación, utilizando el puerto especificado en las variables de entorno o el puerto 3000 por defecto
const port = process.env.PORT || 3000;

// Middleware para permitir el análisis de cuerpos de solicitud JSON
app.use(express.json());

// Definición de rutas y controladores para la gestión de usuarios

// Ruta para obtener todos los usuarios
app.get("/users", async (req: Request, res: Response) => {
  try {
    const text = "SELECT id, name, email FROM users"; // Consulta SQL para seleccionar todos los usuarios
    const result = await pool.query(text); // Ejecución de la consulta en la base de datos
    res.status(200).json(result.rows); // Envío de la respuesta con los usuarios encontrados en formato JSON
  } catch (errors) {
    return res.status(400).json(errors); // Envío de una respuesta de error en caso de fallo
  }
});

// Ruta para crear un nuevo usuario
app.post("/users", async (req: Request, res: Response) => {
  let userDto: User = plainToClass(User, req.body); // Transformación del cuerpo de la solicitud en un objeto de clase User
  try {
    await validateOrReject(userDto); // Validación del objeto de usuario

    const text = "INSERT INTO users(name, email) VALUES($1, $2) RETURNING *"; // Consulta SQL para insertar un nuevo usuario
    const values = [userDto.name, userDto.email]; // Valores para la inserción del usuario
    const result = await pool.query(text, values); // Ejecución de la consulta en la base de datos
    res.status(201).json(result.rows[0]); // Envío de la respuesta con el usuario creado en formato JSON
  } catch (errors) {
    return res.status(422).json(errors); // Envío de una respuesta de error en caso de fallo en la validación
  }
});

// Definición de rutas y controladores para la gestión de tableros

// Ruta para obtener todos los tableros
app.get("/boards", async (req: Request, res: Response) => {
  try {
    const text =
      'SELECT b.id, b.name, bu.userId "adminUserId" FROM boards b JOIN board_users bu ON bu.boardId = b.id WHERE bu.isAdmin IS true'; // Consulta SQL para seleccionar todos los tableros donde el usuario es administrador
    const result = await pool.query(text); // Ejecución de la consulta en la base de datos
    res.status(200).json(result.rows); // Envío de la respuesta con los tableros encontrados en formato JSON
  } catch (errors) {
    return res.status(400).json(errors); // Envío de una respuesta de error en caso de fallo
  }
});

// Ruta para crear un nuevo tablero
app.post("/boards", async (req: Request, res: Response) => {
  let boardDto: Board = plainToClass(Board, req.body); // Transformación del cuerpo de la solicitud en un objeto de clase Board
  const client = await pool.connect(); // Conexión a la base de datos
  try {
    client.query("BEGIN"); // Inicio de una transacción

    await validateOrReject(boardDto, {}); // Validación del objeto de tablero

    const boardText = "INSERT INTO boards(name) VALUES($1) RETURNING *"; // Consulta SQL para insertar un nuevo tablero
    const boardValues = [boardDto.name]; // Valores para la inserción del tablero
    const boardResult = await client.query(boardText, boardValues); // Ejecución de la consulta en la base de datos

    const boardUserText =
      "INSERT INTO board_users(boardId, userId, isAdmin) VALUES($1, $2, $3)"; // Consulta SQL para asociar un usuario como administrador del tablero
    const boardUserValues = [
      boardResult.rows[0].id,
      boardDto.adminUserId,
      true,
    ]; // Valores para la asociación del usuario con el tablero
    await client.query(boardUserText, boardUserValues); // Ejecución de la consulta en la base de datos

    client.query("COMMIT"); // Confirmación de la transacción
    res.status(201).json(boardResult.rows[0]); // Envío de la respuesta con el tablero creado en formato JSON
  } catch (errors) {
    client.query("ROLLBACK"); // Reversión de la transacción en caso de error
    return res.status(422).json(errors); // Envío de una respuesta de error en caso de fallo en la validación
  } finally {
    client.release(); // Liberación del cliente de la conexión a la base de datos
  }
});

// Inicio del servidor Express, escuchando en el puerto especificado
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`); // Mensaje de confirmación de inicio del servidor
});
