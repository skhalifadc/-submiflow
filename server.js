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
    console.error("Database connection error:", error.message);
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

app.listen(PORT, () => {
  console.log(`PrimeDataHub server running on port ${PORT}`);
});
