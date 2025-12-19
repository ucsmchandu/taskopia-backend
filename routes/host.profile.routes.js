const express = require('express');
const hostProfileRouter = express.Router();
const { uploadTask } = require("../controllers/HostControllers/post.task.controller");
const { uploadProfile, getProfile, editProfile } = require('../controllers/HostControllers/host.profile.controllers')
const { getPublicHostProfile } = require('../controllers/HostControllers/host.public.profile.controller');
const upload = require('../utils/multer')

// to upload the host profile
hostProfileRouter.post('/upload/profile', upload.fields([
    { name: "userProfilePhotoUrl", maxCount: 1 },
    { name: "businessProfilePhotoUrl", maxCount: 1 }
]), uploadProfile);

hostProfileRouter.post('/upload-task',
    upload.single("attachments")
    , uploadTask);

// to get the host details using firebase uid only for the host to see their profile details 
hostProfileRouter.get('/get/profile/:firebaseId', getProfile);

// this api route is for public random profile data 
// the one user can watch others
hostProfileRouter.get('/get/public-profile/:publicId', getPublicHostProfile);

// this api is for editing the host profile
hostProfileRouter.put('/edit/profile', editProfile)

module.exports = hostProfileRouter;