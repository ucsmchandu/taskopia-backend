// all routes in this folder comes here

const express = require("express");
const router = express.Router();
const hostProfileRouter = require('./host.routes');
const userRouter=require('./user.routes');
const taskRouter = require("./task.routes");
// const mailRouter=require('./mail');
//  router.use('/mail',mailRouter);

// router to upload,get private profile and get public profile of the host
router.use('/host-profile', hostProfileRouter);

router.use('/auth',userRouter);

router.use('/tasks',taskRouter);


module.exports = router;



//  /taskopia/u1/api/verify/user/auth-user