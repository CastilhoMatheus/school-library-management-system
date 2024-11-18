require("dotenv").config();
var mysql = require("mysql");

// Establishes a connection to the MySQL database using environment variables for security.
// Note: The database is currently empty and has no tables defined.
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = connection;
