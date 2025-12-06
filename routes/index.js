// all routes in this folder comes here

const express=require("express");
const router=express.Router();
const ownerProfileRouter=require('./OwnerProfileRoutes');
// const mailRouter=require('./mail');


//  router.use('/mail',mailRouter);
router.use('/owner-profile',ownerProfileRouter);
 module.exports=router;