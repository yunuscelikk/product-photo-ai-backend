'use strict';

const sequelize = require('../config/config.js');
const { DataTypes } = require('sequelize');

const User = require('./User')(sequelize, DataTypes);
const Image = require('./Image')(sequelize, DataTypes);

User.hasMany(Image, { foreignKey: 'userId', as: 'images'});
Image.belongsTo(User,{ foreignKey: 'userId', as: 'user'});

const db = {
  sequelize,
  User,
  Image
};

module.exports = db;
