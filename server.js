const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const pointageRoutes = require("./routes/pointage");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pointage", pointageRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Attendify");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur port ${PORT}`);
});