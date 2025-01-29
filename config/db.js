

const { Pool } = require('pg');

// Create a connection pool to PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER || 'your_user',        // PostgreSQL user (from .env or environment variable)
  host: process.env.PG_HOST || 'localhost',       // Host, can be 'localhost' or the service name in Docker Compose
  database: process.env.PG_DATABASE || 'your_db', // Database name
  password: process.env.PG_PASSWORD || 'your_password', // Password for the database
  port: process.env.PG_PORT || 5432,              // Port (default for PostgreSQL is 5432)
});
// console.log(pool)


module.exports = pool;
