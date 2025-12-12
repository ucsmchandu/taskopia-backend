const OwnerUserProfileModel=require('../../models/OwnerModels/OwnerUserProfileModel')

// to upload the owner profile data
const uploadProfile=async(req,res)=>{
    try{
        // these are from frontend
        const {
            firebaseUid,
            firstName,
            lastName,
            businessName,
            phone,
            gmail,
            state,
            city,
            pincode,
            address,
            landmark,
            description
        }=req.body;
        // here the two image urls are comes from the middleware which uses cloudinary to store the images
        const newOwnerProfile=new OwnerUserProfileModel({
            firebaseUid:firebaseUid,
            userProfilePhotoUrl:req.files?.userProfilePhotoUrl?.[0]?.path,
            businessProfilePhotoUrl:req.files?.businessProfilePhotoUrl?.[0]?.path,
            firstName:firstName,
            lastName:lastName,
            businessName:businessName,
            phone:phone,
            gmail:gmail,
            description:description,
            addressDetails:[{
                state:state,
                city:city,
                pinCode:pincode,
                address:address,
                landMark:landmark
            }],
        })
        await newOwnerProfile.save();
        return res.json({message:"Owner profile is saved successfully",
            profileId:newOwnerProfile._id,
            profileData:newOwnerProfile
        });
    }catch(err){
        console.log(err);
        console.log(err.message);
       return res.status(500).json({message:"upload file data failed",error:err.message});
        
    }
}

const getProfile=async(req,res)=>{
    try{
        // const {firebaseId}=req.body;
        const firebaseId=req.params.firebaseId;
        const profileData=await OwnerUserProfileModel.findOne({firebaseUid:firebaseId});
        // console.log(profileData)
        if(!profileData)
            return res.status(404).json({message:"user not found"});
        return res.status(200).json({profileData:profileData});
    }catch(err){
        console.log(err);
        console.log(err.message);
        return res.status(500).json({message:"Internal error",error:err.message});
    } 
}

module.exports={uploadProfile,getProfile};