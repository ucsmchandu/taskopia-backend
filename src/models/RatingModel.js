const mongoose=require('mongoose')

const RatingSchema=new mongoose.Schema({
    task:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ActiveTask",
        required:true
    },
    fromUser:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        refPath:"fromModel",
    },
    fromModel:{
        type:String,
        enum:["HostProfile","AllyProfile"],
        required:true
    },
    toUser:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        refPath:"toModel"
    },
    toModel:{
       type:String,
       enum:["HostProfile","AllyProfile"],
       required:true 
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    review:{
        type:String,
        trim:true,
        maxLength:300,
    }
},{timestamps:true});

RatingSchema.index({task:1,fromUser:1,toUser:1},{unique:true});

const RatingModel=mongoose.model("Rating",RatingSchema);

module.exports=RatingModel;