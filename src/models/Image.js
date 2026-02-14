const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Image = sequelize.define('Image', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        originalUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        originalPublicId: {
            type: DataTypes.STRING
        },
        processedUrl: {
            type: DataTypes.STRING
        },
        processedPublicId: {
            type: DataTypes.STRING
        },
        style: {
            type: DataTypes.ENUM(
                'minimalist_white',
                'lifestyle',
                'premium_dark',
                'pastel',
                'natural_wood',
                'studio_pro'
            )
        },
        aspectRatio: {
            type: DataTypes.ENUM('1:1', '9:16', '16:9', '4:5')
        },
        status: {
            type: DataTypes.ENUM('uploaded', 'processing', 'completed', 'failed'),
            defaultValue: 'uploaded'
        },
        processingTime: {
            type: DataTypes.INTEGER
        },
        errorMessage: {
            type: DataTypes.TEXT
        }
    },{
        tableName: 'images',
        timestamps: true
    });

    return Image;
};