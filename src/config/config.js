require('dotenv').config();
const { Sequelize } = require('sequelize'); 

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log // Development için
});

module.exports = sequelize;