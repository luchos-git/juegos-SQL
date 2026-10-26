import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crudo_juegos',
  connectionLimit: 5,
});
//test connection
pool.getConnection()
  .then((connection) => {
    console.log('Conexión a la base de datos establecida :3');
    connection.release(); // Liberar la conexión después de usarla
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });

export default pool;