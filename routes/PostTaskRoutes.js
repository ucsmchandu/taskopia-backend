const express=require('express');
const postTaskRouter=express.Router();
const {uploadTask}=require("../controllers/OwnerControllers/postTaskController");
const upload=require('../utils/multer');
// Todo : middle ware to uplaod the attachments
postTaskRouter.post('/upload-task',
    upload.single("attachments")
    ,uploadTask);

module.exports=postTaskRouter;
