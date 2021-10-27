const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'node_user',
  password: process.env.DB_PASS || 'node_user',
  database: process.env.DB_NAME || 'mydb',
});

module.exports = connection;
