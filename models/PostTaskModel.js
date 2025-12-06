const mongoose=require('mongoose');

const PostTaskSchema=new mongoose.Schema({
    userUid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"OwnerUserProfile",
        required:true
    },
    taskTitle:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        maxLength:[200,'Description cannot be exceed 200 characters'],
        trim:true
    },
    taskCategory:{
        type:String,
        required:true
    },
    budget:{
        type:Number,
        required:true,
        trim:true
    },
    address:{
        type:String,
        required:true,
        trim:true
    },
    urgency:{
        type:String,
        required:true
    },
    startingDate:{
        type:String,
        required:true
    },
    endingDate:{
        type:String,
        required:true
    },
    workingHours:{
        type:String,
        required:true
    },
    postRemovingDate:{
        type:String,
        required:true
    },
    attachments:{
        url:String,
    },   
},{timestamps:true})

const PostTaskModel=mongoose.model('PostJob',PostTaskSchema);
module.exports=PostTaskModel;