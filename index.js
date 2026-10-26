import express from 'express';
import pool from './config/conexion.js';


const app = express();
const PORT = 3000;

//test connection
pool.getConnection()

app.use(express.json());


app.get('/', (req, res) => {
  res.send('Api rest mySQL - juegos');
});



app.get('/juegos', async (req, res) => {
  // res.send('Lista de juegos');
  
  const sql = 'SELECT * FROM juegos';
  try{
    const connection = await pool.getConnection();
    const [rows] = await connection.query(sql);
    connection.release();
    res.json(rows);
  }catch(error){
    res.status(500).send('Error, no se pudo realizar la consulta');
  }
  
});

app.get('/juegos/:id', async (req, res) => {
   const id = parseInt(req.params.id);
  const sql = 'SELECT * FROM juegos WHERE id = ?';
  try{
    const connection = await pool.getConnection();
    const [rows] = await connection.query(sql, [id]);
    connection.release();
    rows[0] ? res.json(rows[0]) : res.status(404).send('No hay resultados');
  }catch(error){
    res.status(500).send('Error, no se pudo realizar la consulta');
  }
});

app.put('/juegos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const valores = req.body;
  const sql = 'UPDATE juegos SET ? WHERE id = ?';
  try {
  const connection = await pool.getConnection();
  const [rows] = await connection.query(sql, [valores, id]);
  connection.release();
  rows.affectedRows == 0 ? res.send('Juego no encontrado') : res.status(200).send('Juego actualizado exitosamente');

  }catch (error) {
    res.status(500).send('Error al actualizar juego');
  }
})



//nuevo registro
app.post('/juegos', async(req, res) => {
  const valor = req.body;
  const sql = 'INSERT INTO juegos SET ?';

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(sql, [valor]);
    connection.release();

    res.status(201).send('Juego creado exitosamente');
  } catch (error) {
    res.status(500).send('Error al crear juego');
  }
});

app.delete('/juegos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const sql = 'DELETE FROM juegos WHERE id = ?';

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(sql, [id]);
    connection.release();
    rows.affectedRows == 0 ? res.send('Juego no encontrado') : res.status(200).send();
  } catch (error) {
    res.status(500).send('Error al eliminar juego');
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
