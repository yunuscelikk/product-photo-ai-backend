const { Image } = require('../models');
const storageService = require('../services/storageService');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'Image required'});
        }

        const uploadResult = await storageService.uploadImage(req.file.buffer, 'originals');

        const image = await Image.create({
            userId: req.user.id,
            originalUrl: uploadResult.url,
            originalPublicId: uploadResult.publicId,
            status: 'uploaded'
        });

        res.status(201).json({
            success: true,
            data: {
                imageId: image.id,
                originalUrl: image.originalUrl,
                status: image.status
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed'});
    }
};

exports.listImages = async (req, res) => {
    try {
        const images = await Image.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            data: images
        });
    } catch (error) {
        res.status(500).json({error: 'List cant fetch'});
    }
};

