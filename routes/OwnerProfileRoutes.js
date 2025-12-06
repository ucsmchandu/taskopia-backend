const express=require('express');
const ownerProfileRouter=express.Router();
const {uploadProfile,getProfile}=require('../controllers/OwnerControllers/ownerProfileControllers')
const {getPublicOwnerProfile}=require('../controllers/OwnerControllers/ownerPublicProfile');
const upload=require('../utils/multer')

// to upload the owner profile
ownerProfileRouter.post('/upload/profile',upload.fields([
    { name:"userProfilePhotoUrl",maxCount:1 },
    { name:"businessProfilePhotoUrl",maxCount:1 }
]),uploadProfile);


// to get the owner details using firebase uid only for the owner to see their profile details 
ownerProfileRouter.get('/get/profile/:firebaseId',getProfile);

// this api route is for public random profile data 
// the one user can watch others
ownerProfileRouter.get('/get/public-profile/:publicId',getPublicOwnerProfile);
module.exports=ownerProfileRouter;