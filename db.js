const mongoose=require('mongoose');

/**
 * Connects the backend server to MongoDB using the DBURL environment variable.
 *
 * @async
 * @returns {Promise<void>} Resolves after MongoDB connects, or exits the process when the connection fails.
 */
const connectDB=async()=>{
    try{
        const URL=process.env.DBURL;
        await mongoose.connect(URL);
        console.log("mongo db is connected");
    }catch(err){
        console.log(err);
        console.log(err.message);
        process.exit(1);
    }
}

module.exports=connectDB;
