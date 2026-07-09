const RatingModel=require('../models/RatingModel')
const PostTaskModel=require('../models/HostModels/PostTaskModel')
const AllyProfileModel=require('../models/AllyModels/AllyProfileModel')
const HostProfileModel=require('../models/HostModels/HostProfileModel')
const {redisClient}=require('../config/redis')

const getAllyProfileCacheKey=(id)=>`allyProfile:${id}`;
const getHostProfileCacheKey=(id)=>`hostProfile:${id}`;

const invalidateProfileCaches=async(profileModel,...profileIds)=>{
    const prefix=profileModel==="AllyProfile" ? "allyProfile" : "hostProfile";
    const getProfileCacheKey=profileModel==="AllyProfile" ? getAllyProfileCacheKey : getHostProfileCacheKey;
    const keys=[`${prefix}:all`];

    profileIds.filter(Boolean).forEach((profileId)=>{
        keys.push(getProfileCacheKey(profileId));
    });

    try{
        await redisClient.del(...keys);
    }catch(err){
        console.error("redis cache invalidation failed:",err);
    }
};

/**
 * crates a rating for a completed task between the authenticated host and ally.
 *
 * if the authenticated user is the task host, they rate the assigned ally.
 * if the authenticated user is the assigned ally, they rate the task host.
 * a user can rate the other party only once per task.
 *
 * @async
 * @param {Object} req.body - request body.
 * @param {number} req.body.rating - rating value from 1 to 5.
 * @param {string} [req.body.review] - optional review text for the rated user..
 * @returns {Promise<void>} sends a json response with the created rating or an error message.
 */
const createRating=async(req,res)=>{
    try{
        const {uid}=req.firebaseUser;
        const {taskId}=req.params;
        const {rating,review}=req.body;

        // checking rating
        if(!rating || rating<1 || rating>5){
            return res.status(400).json({
                message:"rating must be between 1 and 5"
            });
        }

        const task=await PostTaskModel.findById(taskId);

        if(!task){
            return res.status(404).json({
                message:'task not found'
            })
        };

        if(task.status!=="completed"){
            return res.status(400).json({
                message:"you can rate only after task completed."
            });
        }

        const host=await HostProfileModel.findOne({firebaseUid:uid});
        const ally=await AllyProfileModel.findOne({firebaseUid:uid});

        let fromUser,fromModel,toUser,toModel;

        if(host && task.createdBy?.toString()===host._id.toString()){
            fromUser=host._id;
            fromModel="HostProfile";
            toUser=task.assignedAlly;
            toModel="AllyProfile"
        }else if(ally && task.assignedAlly?.toString()===ally._id.toString()){
            fromUser=ally._id;
            fromModel="AllyProfile";
            toUser=task.createdBy;
            toModel="HostProfile"
        }else{
            return res.status(403).json({
                message:"not authorized to rate this task"
            });
        }

        const newRating=new RatingModel({
            task:task._id,
            fromUser,
            fromModel,
            toUser,
            toModel,
            rating,
            review
        });

        await newRating.save();

        await updateAverageRating(toUser,toModel);

        return res.status(201).json({
            message:"rating submitted successfully",
            rating:newRating
        })

    }catch(err){
        console.log(err);

        if(err.code===11000){
            return res.status(409).json({
                message:"you already rated this user for this task"
            })
        }

        res.status(500).json({
            message:"Internal server error."
        })
    }
}

/**
 * reclculates and updates the average rating summary for a profile.
 *
 * the rating collection is treated as the source of truth, and the profiles
 * rating field is updated only as a fast summary for display.
 *
 * @async
 * @param {import("mongoose").Types.ObjectId} profileId - mongodb objectid of the rated profile.
 * @param {"AllyProfile"|"HostProfile"} profileModel - profile model name to update.
 * @returns {Promise<void>} resolves after the profile rating summary is updated.
 */
const updateAverageRating=async(profileId,profileModel)=>{
    const result=await RatingModel.aggregate([
        {
            $match:{
                toUser:profileId,
                toModel:profileModel
            },
        },
        {
            $group:{
                _id:"$toUser",
                average:{$avg:"$rating"},
                count:{$sum:1},
            },
        },
    ]);

    const stats=result[0] || {average:0,count:0};

    const Model=profileModel==="AllyProfile" ? AllyProfileModel : HostProfileModel;

    const updatedProfile=await Model.findByIdAndUpdate(profileId,{
        rating:{
            average:Number(stats.average.toFixed(1)),
            count:stats.count,
        }
    },{new:true});

    await invalidateProfileCaches(profileModel,profileId,updatedProfile?.firebaseUid);
};

module.exports=createRating;
