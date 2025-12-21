// all routes in this folder comes here

const express = require("express");
const router = express.Router();
const hostProfileRouter = require('./host.routes');

// const mailRouter=require('./mail');
//  router.use('/mail',mailRouter);

// router to upload,get private profile and get public profile of the host
router.use('/host-profile', hostProfileRouter);





module.exports = router;



//  /taskopia/u1/api/verify/user/auth-user