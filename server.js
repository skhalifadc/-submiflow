const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Create PrimeDataHub database tables
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id BIGSERIAL PRIMARY KEY,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id BIGSERIAL PRIMARY KEY,
      customer_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
      package_name VARCHAR(150) NOT NULL,
      form_data JSONB NOT NULL DEFAULT '{}',
      status VARCHAR(30) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY,
      submission_id BIGINT REFERENCES submissions(id),
      provider VARCHAR(50) DEFAULT 'Paystack',
      reference VARCHAR(255) UNIQUE NOT NULL,
      amount INTEGER NOT NULL,
      currency VARCHAR(10) DEFAULT 'NGN',
      status VARCHAR(30) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      paid_at TIMESTAMPTZ
    );
  `);

  console.log("PrimeDataHub database tables are ready.");
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PrimeDataHub backend is running!",
    platform: "PrimeDataHub"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({
      status: "healthy",
      database: "connected",
      service: "PrimeDataHub Backend"
    });
  } catch (error) {
    console.error(error.message);
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`PrimeDataHub running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });
