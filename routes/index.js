// all routes in this folder comes here

const express=require("express");
const router=express.Router();
const ownerProfileRouter=require('./OwnerProfileRoutes');
const postTaskRouter=require('./PostTaskRoutes');
// const mailRouter=require('./mail');


//  router.use('/mail',mailRouter);
router.use('/owner-profile',ownerProfileRouter);

// router for owner to post the task
router.use('/owner/task',postTaskRouter)
 module.exports=router;



//  /taskopia/u1/api//owner/task/upload-task