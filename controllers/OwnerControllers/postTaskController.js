const PostTaskModel=require('../../models/OwnerModels/PostTaskModel');
const uploadTask=async(req,res)=>{
    try{
        const {
            firebaseId,
            email,
            title,
            taskDescription,
            taskCategory,
            location,
            amount,
            urgencyLevel,
            startingDate,
            endingDate,
            workingHours,
            postRemovingDate,
            attachments  //url
        }=req.body;
        // console.log(attachments);
        // console.log("img url :",req.file.path);
        const newTask=new PostTaskModel({
            firebaseId:firebaseId,
            taskTitle:title,
            description:taskDescription,
            taskCategory:taskCategory,
            budget:amount,
            address:location,
            email:email,
            urgency:urgencyLevel,
            startingDate:startingDate,
            endingDate:endingDate,
            workingHours:workingHours,
            postRemovingDate:postRemovingDate,
            attachments:req.file?.path || null
        });
        await newTask.save();
        return res.status(200).json({
            message:"Task Uploaded successful",
            taskId:newTask._id,
            uploadTask:"true"
        });
    }catch(err){
        console.log(err);
        console.log(err.message);
        return res.status(500).json({
            message:"Uploading task is incomplete",
            uploadTask:"false"
        })
    }
}
module.exports={uploadTask};