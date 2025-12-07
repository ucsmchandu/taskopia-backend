const express=require('express');
const postTaskRouter=express.Router();
const {uploadTask}=require("../controllers/OwnerControllers/postTaskController");


postTaskRouter.post('/upload-task',uploadTask);

module.exports=postTaskRouter;
