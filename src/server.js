require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
const { sequelize } = require('./models');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const imageRoutes= require('./routes/images');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many request, please wait and try again'},
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15 dakikada max 5 giriş denemesi
  message: { error: 'Too many try, please retry 15 minutes later' }
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/', limiter);
app.use('/api/auth', authLimiter,authRoutes)
app.use('/api/user', userRoutes);
app.use('/api/images', imageRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API is healthy",
  });
});

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("db connection successfull");

    await sequelize.sync({ force: false});
    console.log('db sync complete');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
});
  } catch (error) {
    console.error('Error: ', error);
    process.exit(1);
  }
}

startServer();
