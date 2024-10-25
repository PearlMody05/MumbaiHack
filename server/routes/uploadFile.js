const cloudinary=require("cloudinary").v2;
const express = require('express')
const router=express.Router();
const upload =require("../middleware/multer");
require("dotenv").config();


const uploadFiles = (req, res) => {
    console.log(req);
    upload.single('file')(req, res, async (err) => {
      console.log(req.file);
  
      if (err) {
        console.error('Error during file upload:', err);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
      }
  
      if (req.file) {
        try {
          // Determine the file format (mime type)
          const fileFormat = req.file.mimetype.split('/')[1];
  
          // Set Cloudinary upload options based on file type (media vs raw files)
          const uploadOptions = {
            resource_type: fileFormat === 'csv' ? 'raw' : 'auto',  // 'raw' for CSV, 'auto' for images
            public_id: req.file.originalname.split('.')[0].replace(/[^a-zA-Z0-9-_]/g, ""), // Safe public_id
            folder: fileFormat === 'csv' ? 'Documents' : 'Users',  // Use separate folders for media and documents
          };
  
          // Upload the file to Cloudinary with the appropriate options
          const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
          console.log(result);
          // Return the URL of the uploaded file (image or CSV)
          res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            fileUrl: result.secure_url,
          });
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          res.status(500).json({ message: 'File upload failed', error: uploadError.message });
        }
      } else {
        console.log('No file uploaded');
        res.status(400).json({ message: 'No file uploaded' });
      }
    });
  };


  
router.post("/uploadFiles",uploadFiles);

module.exports =router;
