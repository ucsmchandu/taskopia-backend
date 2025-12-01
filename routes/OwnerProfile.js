const express=require('express');
const ownerProfileRouter=express.Router();
const {uploadProfile,getProfile}=require('../controllers/ownerProfileControllers')
const upload=require('../utils/multer')

// TODO : here comes the middle ware for the file upload
ownerProfileRouter.post('/upload/profile',upload.fields([
    { name:"userProfilePhotoUrl",maxCount:1 },
    { name:"businessProfilePhotoUrl",maxCount:1 }
]),uploadProfile);
ownerProfileRouter.get('/get/profile/:firebaseId',getProfile);
module.exports=ownerProfileRouter;