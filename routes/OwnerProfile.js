const express=require('express');
const ownerProfileRouter=express.Router();
const {uploadProfile,getProfile}=require('../controllers/ownerProfileControllers')


ownerProfileRouter.post('/upload/profile',uploadProfile);
ownerProfileRouter.get('/get/profile',getProfile);
module.exports=ownerProfileRouter;