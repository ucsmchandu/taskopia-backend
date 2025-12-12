const mongoose=require('mongoose');

const ApplyTaskSchema=new mongoose.Schema({
    workerUid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'WorkerUserProfile',
        required:true
    },
    taskUid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'PostTask',
        required:true
    },
    startImmediately:{
        type:Boolean,
        required:true,
    },
    expectedPay:{
        type:String,
        required:true
    },
    workerMessage:{
        type:String,
        maxLength:[100,'Message cannot be exceed 100 characters']
    }
    
},{timestamps:true});

const ApplyTask=mongoose.model('ApplyJob',ApplyTaskSchema);
module.exports=ApplyTask