const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: { isEmail: true }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING
        },
        subscriptionType: {
            type: DataTypes.ENUM('free', 'premium'),
            defaultValue: 'free'
        },
        dailyQuota: {
            type: DataTypes.INTEGER,
            defaultValue: 3
        },
        dailyUsed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lastQuotaReset: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'users',
        timestamps: true
    });

    return User;
};