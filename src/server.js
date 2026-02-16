const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
require("dotenv").config();
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
