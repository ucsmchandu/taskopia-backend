const express = require('express')
const allyProfileRouter = express.Router();
const { uploadProfile, getProfile, editProfile,getPublicAllyProfile } = require('../controllers/AllyControllers/ally.profileController')
const checkAuth = require('../middlewares/auth.middleware');
const upload = require('../utils/multer');

allyProfileRouter.post('/upload/profile', checkAuth, upload.single("userProfilePhotoUrl"), uploadProfile);
allyProfileRouter.get('/get/profile', checkAuth, getProfile)
allyProfileRouter.patch('/edit/profile', checkAuth,upload.single('userProfilePhotoUrl'),editProfile)
allyProfileRouter.get('/get/public-profile/:publicId',checkAuth,getPublicAllyProfile)
module.exports = allyProfileRouter