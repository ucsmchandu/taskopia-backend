const express = require('express');
const hostProfileRouter = express.Router();
const { uploadProfile, getProfile, editProfile, editProfileViaJson,getPublicHostProfile } = require('../controllers/HostControllers/host.profile.controllers')
const upload = require('../utils/multer')
const checkAuth=require('../middlewares/auth.middleware')
// to upload the host profile
hostProfileRouter.post('/upload/profile', checkAuth,upload.fields([
    { name: "userProfilePhotoUrl", maxCount: 1 },
    { name: "businessProfilePhotoUrl", maxCount: 1 }
]), uploadProfile);

// to get the host details using firebase uid only for the host to see their profile details 
hostProfileRouter.get('/get/profile', checkAuth ,getProfile);

// this api route is for public random profile data 
// the one user can watch others
hostProfileRouter.get('/get/public-profile/:publicId',checkAuth ,getPublicHostProfile);

// this api is for editing the host profile with including the profile pictures (using multikart data)
hostProfileRouter.patch('/edit/profile',checkAuth ,upload.fields([
    { name: "userProfilePhotoUrl", maxCount: 1 },
    { name: "businessProfilePhotoUrl", maxCount: 1 }
]), editProfile)

// this api is for updating the host profile without profile pictures (using json)
hostProfileRouter.patch('/edit/profile/json',checkAuth,editProfileViaJson);

module.exports = hostProfileRouter;