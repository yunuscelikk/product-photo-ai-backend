const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

class StorageService {
    async uploadImage(buffer, folder = 'originals') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `product-photo-ai/${folder}`,
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                }
            );

            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    }

    async deleteImage(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
}

module.exports = new StorageService();