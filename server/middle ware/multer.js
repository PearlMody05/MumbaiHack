const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Allowing csv file format
const supportedFormats = ['csv'];

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const fileFormat = file.mimetype.split('/')[1];

    // Validate if file format is supported (now includes csv)
    if (!supportedFormats.includes(fileFormat)) {
      throw new Error('Unsupported file format');
    }

    // Configure Cloudinary upload settings for .csv files
    return {
      folder: 'Documents',  // Create a folder for CSV files, for example
      format: fileFormat, // For .csv it will simply store as .csv
      public_id: file.originalname.split('.')[0].replace(/[^a-zA-Z0-9-_]/g, ""), // Safe public ID
      resource_type: fileFormat === 'csv' ? 'raw' : 'auto', // 'raw' for non-media files
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;