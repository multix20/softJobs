import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logger } from './middlewares/logger.js';
import { validarToken } from './middlewares/validateToken.js';
import { verificarCredenciales } from './middlewares/verifyCredentials.js';

// Cargar variables de entorno
dotenv.config();

// Inicializar la aplicación
const app = express();
app.use(express.json());

// Configurar CORS (debe ir antes de las rutas)
app.use(cors({
  origin: 'http://localhost:5173', // Permitir el origen del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  credentials: true // Permitir envío de cookies o credenciales (opcional)
}));

// Middleware global para registrar todas las solicitudes
app.use(logger);

// Configuración de PostgreSQL
const { Pool } = pkg;
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Verificar conexión a la base de datos
pool.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Ruta para registrar nuevos usuarios
app.post('/usuarios', verificarCredenciales, async (req, res) => {
  const { email, password, rol, lenguage } = req.body;

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario en la base de datos
    const query = `
      INSERT INTO usuarios (email, password, rol, lenguage)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [email, hashedPassword, rol, lenguage];
    const result = await pool.query(query, values);

    // Responder con los datos del usuario registrado
    res.status(201).json({ message: 'Usuario registrado con éxito', usuario: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registrando usuario' });
  }
});

// Ruta para autenticación de usuarios
app.post('/login', verificarCredenciales, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const query = `SELECT * FROM usuarios WHERE email = $1;`;
    const values = [email];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign({ email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Autenticación exitosa', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error autenticando usuario' });
  }
});

// Ruta para obtener datos del usuario autenticado
app.get('/usuarios', validarToken, async (req, res) => {
  try {
    const query = `SELECT id, email, rol, lenguage FROM usuarios WHERE email = $1;`;
    const values = [req.user.email];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
