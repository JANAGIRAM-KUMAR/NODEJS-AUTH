const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const uploadMiddleware = require('../middleware/upload-middleware');
const {uploadImage, fetchImage, deleteImage} = require('../controllers/image-controller'); //controller


const router = express.Router();

//upload the image
router.post('/upload', 
    authMiddleware, 
    adminMiddleware, 
    uploadMiddleware.single('image'), 
    uploadImage);

// get all the images
router.get('/get', authMiddleware, fetchImage)

//delete an image
router.delete('/:id', authMiddleware, adminMiddleware, deleteImage);

module.exports = router;