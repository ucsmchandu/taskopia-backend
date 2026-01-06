const {v2:cloudinary} =require("cloudinary");

try{
    cloudinary.config({
    cloudinary_url:process.env.CLOUDINARY_URL,
    secure:true
});
console.log("cloudinary is connected");
}catch(err){
    console.log(err);
    console.log(err.message);
}


module.exports=cloudinary;