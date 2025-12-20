const multer=require('multer')
const {CloudinaryStorage}=require("multer-storage-cloudinary");
const cloudconnect=require('./cloudinary');

const storage=new CloudinaryStorage({
    cloudinary:cloudconnect,
    params:{
        folder:"taskopia",
        resource_type:"auto", ///automatically detects 
    }
});

const upload=multer({storage});
module.exports=upload;