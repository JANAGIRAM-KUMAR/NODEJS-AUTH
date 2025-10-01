const mongoose = require("mongoose");

const connectToDatabase = async () => {
    try{
        mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo DB connected successfully");
    }
    catch(err){
        console.log("Error: ",err);
        process.exit(1);
    }
}

module.exports = connectToDatabase;