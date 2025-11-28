const mongoose=require('mongoose');

const connectDB=async()=>{
    try{
        const URL=process.env.DBURL;
        await mongoose.connect(URL);
        console.log("mongo db is connected");
    }catch(err){
        console.log(err);
        console.log(err.message);
        return;
    }
}

module.exports=connectDB;