const User = require('../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
// register controller

const registerUser = async (req, res) => {
    try{
        //extract user info from request body
        const {username, email, password, role} = req.body;

        //check if the user already exists in the database
        const checkExistingUser = await User.findOne({$or : [{username, email}]});
        if(checkExistingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists with this username or email, Please try with different username or email"
            });
        }

        //hash user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await newUser.save();

        if(newUser){
            res.status(201).json({
                success : true,
                message : "User registered successfully"
            })
        }
        else {
            res.status(400).json({
                success : false,
                message : "Unable to register user, Please try again"
            })
        }

    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Some error occured, Please try again"
        });
    }
}

// login controller

const loginUser = async (req, res) => {
    try{
        const {username, password} = req.body;

        //find if the user exists in the database
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({
                success : false,
                message : 'User doesn\'t exist'
            })
        }

        //check if password is correct or not
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success : false,
                message : 'Invalid credentials!'
            })
        }

        // create user token

        const accessToken = await jwt.sign({
            userId : user._id,
            username : user.username,
            role : user.role,
        }, process.env.JWT_SECRET_KEY, {expiresIn : '30m'})

        res.status(200).json({
            success : true,
            message : "User logged in successfully",
            accessToken
        })



    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Some error occured, Please try again"
        });
    }
}

const changePassword = async (req,res) => {
    try{
        const userId = req.userInfo.userId;

        // extract old and new password
        const {oldPassword, newPassword} = req.body;

        //to find the current logged in user
        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({
                success : false,
                message : "User not found"
            })
        }

        // if old password is correct
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success : false,
                message : "Old password is incorrect"
            })
        }

        //hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        //update the password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success : true,
            message : "Password changed successfully"
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Some error occured, Please try again"
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    changePassword
}