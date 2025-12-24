// all routes in this folder comes here

const express = require("express");
const router = express.Router();
const hostProfileRouter = require('./host.routes');
const userRouter=require('./user.routes');
const taskRouter = require("./task.routes");
const allyProfileRouter=require('./ally.routes')
// const mailRouter=require('./mail');
//  router.use('/mail',mailRouter);

// router to upload,get private profile and get public profile of the host
router.use('/host-profile', hostProfileRouter);

// authentication 
router.use('/auth',userRouter);

// host tasks operations
router.use('/tasks',taskRouter);

// ally profile operations
router.use('/ally-profile',allyProfileRouter);

module.exports = router;



//  /taskopia/u1/api/verify/user/auth-user