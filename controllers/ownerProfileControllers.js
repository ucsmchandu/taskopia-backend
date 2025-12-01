const OwnerUserProfile=require('../models/OwnerUserProfile')

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
        const newOwnerProfile=new OwnerUserProfile({
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
        return res.json({message:"Owner profile is saved successfully",newOwnerProfile});
    }catch(err){
        console.log(err);
        console.log(err.message);
        res.status(500).json({message:"upload file data failed",error:err.message});
        return;
    }
}

const getProfile=()=>{
    console.log("get profile");
}

module.exports={uploadProfile,getProfile};