import express from 'express';
import pool from './config/conexion.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// CORS: el front (index.html) se abre desde otro origen (live server, file://, etc)
// y sin estos headers el navegador bloquea los fetch a localhost:3000
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204); // respuesta al "preflight" del navegador
  next();
});

// de lo que manda el front me quedo solo con los 3 campos de la tabla (el id lo pone mysql)
const camposJuego = (body) => ({
  titulo: String(body.titulo ?? '').trim(),
  genero: String(body.genero ?? '').trim(),
  consola: String(body.consola ?? '').trim(),
});

// los 3 campos son obligatorios (NOT NULL en la tabla)
const juegoValido = (j) => j.titulo && j.genero && j.consola;

app.get('/', (req, res) => {
  res.send('Api rest mySQL - juegos');
});

app.get('/juegos', async (req, res) => {
  const sql = 'SELECT * FROM juegos';
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error, no se pudo realizar la consulta');
  } finally {
    if (connection) connection.release();
  }
});

app.get('/juegos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const sql = 'SELECT * FROM juegos WHERE id = ?';
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(sql, [id]);
    rows[0] ? res.json(rows[0]) : res.status(404).send('No hay resultados');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error, no se pudo realizar la consulta');
  } finally {
    if (connection) connection.release();
  }
});

//nuevo registro
// responde con el juego creado (ya con su id) porque el front lo agrega a su cache con ese id
app.post('/juegos', async (req, res) => {
  const valor = camposJuego(req.body);
  if (!juegoValido(valor)) return res.status(400).send('Faltan datos del juego');

  const sql = 'INSERT INTO juegos SET ?';
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(sql, [valor]);
    res.status(201).json({ id: result.insertId, ...valor });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear juego');
  } finally {
    if (connection) connection.release();
  }
});

app.put('/juegos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const valores = camposJuego(req.body);
  if (!juegoValido(valores)) return res.status(400).send('Faltan datos del juego');

  const sql = 'UPDATE juegos SET ? WHERE id = ?';
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(sql, [valores, id]);
    if (result.affectedRows == 0) return res.status(404).send('Juego no encontrado');
    res.status(200).json({ id, ...valores });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar juego');
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/juegos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const sql = 'DELETE FROM juegos WHERE id = ?';
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(sql, [id]);
    if (result.affectedRows == 0) return res.status(404).send('Juego no encontrado');
    res.status(200).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar juego');
  } finally {
    if (connection) connection.release();
  }
});

app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//npm run dev = agrega nodemon para actualizar el codigo automaticamente
//npm run start = inicia sin actualizar nuevo codigo
