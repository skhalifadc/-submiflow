const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PrimeDataHub backend is running!",
    platform: "PrimeDataHub"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "PrimeDataHub Backend"
  });
});

app.listen(PORT, () => {
  console.log(`PrimeDataHub server running on port ${PORT}`);
});
