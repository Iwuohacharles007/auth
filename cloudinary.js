const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg'],
        transformation: [
            {
                width: 1000,
                height: 700,
                crop: 'limit',
                quality: 'auto',
                fetch_format: 'auto'
            }
        ]
    }
});

module.exports = { cloudinary, storage };