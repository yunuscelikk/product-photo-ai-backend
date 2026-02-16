const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API is healthy",
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
