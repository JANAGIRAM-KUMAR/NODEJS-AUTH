const Image = require('../models/Image');
const {uploadToCloudinary} = require('../helpers/cloudinary-helper');
const fs = require('fs');
const cloudinary = require('../config/cloudinary')

const uploadImage = async (req, res) => {
    try {
        //check if file is missing in request
        if(!req.file){
            return res.status(400).json({
                success : false,
                message : "File is missing in request"
            })
        }
        //upload to cloudinary
        const {url, publicId} = await uploadToCloudinary(req.file.path);

        // store the url and public id along with user id in the database
        const newlyUploadedImage = await Image.create({
            url,
            publicId,
            uploadedBy : req.userInfo.userId
        });

        //delete the image from local storage
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success : true,
            message : "Image uploaded successfully",
            data : newlyUploadedImage
        })

    } catch (error) {
        res.status(500).json({
            success : false,
            message : "Something went wrong",
        })
    }
}

const fetchImage = async (req,res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1;
        const skip = (page - 1)*limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'asc' ? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages/limit);

        const sortObj = {};
        sortObj[sortBy] = sortOrder;

        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

        if(images){
            return res.status(200).json({
                success : true,
                currentPage : page,
                totalPages : totalPages,
                totalImages : totalImages,
                data: images
            })
        }
    
    }
    catch(error){
        res.status(500).json({
            success : false,
            message : "Something went wrong",
        })
    }
}

const deleteImage = async (req,res) => {
    try{
        const getCurrentImageId = req.params.id;
        const userId = req.userInfo.userId;

        const image = await Image.findById(getCurrentImageId);
        if(!image){
            return res.status(400).json({
                success : false,
                message : "Image not found"
            })
        }

        // check if the image is uploaded by the current user who is trying to delet it
        if(image.uploadedBy.toString() != userId){
            res.status(403).json({
                success : false,
                message : "You are not authorized to delete this image"
            });
        }

        // delete the image from cloudinary
        await cloudinary.uploader.destroy(image.publicId);

        // delete image from Mongo DB
        await Image.findByIdAndDelete(getCurrentImageId);

        res.status(200).json({
            success : true,
            message : "Image deleted successfully"
        });
        
    }
    catch(error){
        res.status(500).json({
            success : false,
            message : "Something went wrong",
        })
    }
}
module.exports = {
    uploadImage,
    fetchImage,
    deleteImage
}