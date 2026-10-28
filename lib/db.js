const mysql = require("mysql2/promise");

let pool;

function getPool() {
  if (!pool) {
    const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`Missing database environment variables: ${missing.join(", ")}`);
    }

    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 4000),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      ssl: { rejectUnauthorized: true },
      charset: "utf8mb4"
    });
  }
  return pool;
}

module.exports = { getPool };
