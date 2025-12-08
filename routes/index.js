// all routes in this folder comes here

const express=require("express");
const router=express.Router();
const ownerProfileRouter=require('./OwnerProfileRoutes');
const postTaskRouter=require('./PostTaskRoutes');

// const mailRouter=require('./mail');
//  router.use('/mail',mailRouter);

// router to upload,get private profile and get public profile of the owner
router.use('/owner-profile',ownerProfileRouter);

// router for owner to post the task by owner
router.use('/owner/task',postTaskRouter)




module.exports=router;



//  /taskopia/u1/api/verify/user/auth-user