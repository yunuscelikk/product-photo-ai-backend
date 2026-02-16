'use strict';

const sequelize = require('../config/config.js');
const { DataTypes } = require('sequelize');

const User = require('./User')(sequelize, DataTypes);
// const Product = require('./Product')(sequelize, DataTypes);

const db = {
  sequelize,
  User,
};

module.exports = db;
