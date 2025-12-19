const HostProfileModel=require("../../models/HostModels/HostProfileModel")
const getPublicHostProfile=async(req,res)=>{
    try{
        //get the id from the url
        const _id=req.params.publicId;
        const profileData=await HostProfileModel.findById({_id});
        if(!profileData)
            return res.status(404).json({message:"User Profile Not Found"});
        return res.status(200).json({profileData:profileData});
    }catch(err){
        console.log(err);
        console.log(err.message);
        return res.status(500).json({message:"Internal error",error:err.message});
    }
}

module.exports={getPublicHostProfile}