const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (filePath) => {
    try{
        const result = await cloudinary.uploader.upload(filePath);
        return {
            publicId : result.public_id,
            url : result.secure_url
        }
    }
    catch(err){
        console.log('Error in uploading to cloudinary: ', err);
        throw new Error('Error in uploading to cloudinary');       
    }
}

module.exports = {
    uploadToCloudinary
}