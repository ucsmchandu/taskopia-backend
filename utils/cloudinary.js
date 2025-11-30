const {v2:cloudinary} =require("cloudinary");

try{
    cloudinary.config({
    cloudinary_url:process.env.CLOUDINARY_URL,
    secure:true
});
}catch(err){
    console.log(err);
    console.log(err.message);
}

console.log("cloudinary is connected");

module.exports=cloudinary;