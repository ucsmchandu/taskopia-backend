const HostProfileModel = require('../../models/HostModels/HostProfileModel')
const createNotification = require('../../utils/createnotification');

// to upload the host profile data
const uploadProfile = async (req, res) => {
    const { uid, email, email_verified } = req.firebaseUser;
    // console.log(uid);
    // console.log(email);
    // console.log(email_verified);
    try {
        // these are from frontend
        const {
            // firebaseUid,
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
        } = req.body;
        // here the two image urls are comes from the middleware which uses cloudinary to store the images
        const newHostProfile = new HostProfileModel({
            firebaseUid: uid,
            userProfilePhotoUrl: req.files?.userProfilePhotoUrl?.[0]?.path,
            businessProfilePhotoUrl: req.files?.businessProfilePhotoUrl?.[0]?.path,
            firstName: firstName,
            lastName: lastName,
            businessName: businessName,
            phone: phone,
            gmail: gmail,
            description: description,
            addressDetails: {
                state: state,
                city: city,
                pinCode: pincode,
                address: address,
                landMark: landmark
            },
        })
        await newHostProfile.save();

        // send notification for host
        await createNotification({
            userId: newHostProfile._id,
            userModel: "HostProfile",
            type: "HOST_PROFILE_CREATED",
            title: "Profile Created.",
            message: "Your host profile has been created successfully.",
            link: "/profile/host", 
            meta: {
                profileId: newHostProfile._id
            }
        })
        return res.json({
            message: "Host profile is saved successfully",
            profileId: newHostProfile._id,
            profileData: newHostProfile
        });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        return res.status(500).json({ message: "upload file data failed", error: err.message });

    }
}

const getProfile = async (req, res) => {
    try {
        const { uid, email, email_verified, name } = req.firebaseUser;
        // console.log(uid);
        // console.log(email);
        // console.log(email_verified);
        // console.log(name);
        // const {firebaseId}=req.body;
        // const firebaseId = req.params.firebaseId;
        const profileData = await HostProfileModel.findOne({
            firebaseUid: uid
        });
        // console.log(firebaseId)
        if (!profileData)
            return res.status(404).json({ message: "user not found" });
        return res.status(200).json({ profileData: profileData });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        return res.status(500).json({ message: "Internal error", error: err.message });
    }
}


// this is also working with files nd without files
// this only supports the data with files only plain json is not supported
const editProfile = async (req, res) => {
    const { uid, email, email_verified } = req.firebaseUser;
    // console.log(uid);
    // console.log(email);
    // console.log(email_verified);
    // const firebaseUid = req.params.firebaseUid;
    try {
        // finds the host old profile
        const profile = await HostProfileModel.findOne({ firebaseUid: uid });
        if (!profile)
            return res.status(404).json({ message: "Host Not found!" });
        // console.log(profile._id);

        const updates = {};

        const fields = ["firstName", "lastName", "businessName", "phone", "gmail", "description"];
        fields.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

        const addrFields = ["state", "city", "pincode", "address", "landmark"];
        const addrUpdates = {};
        addrFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field == "landmark") addrUpdates.landMark = req.body[field];
                else if (field == "pincode") addrUpdates.pinCode = req.body[field];
                else addrUpdates[field] = req.body[field];
            }
        });
        // if(Object.keys(addrUpdates).length)
        //     updates.addressDetails={};
        // if (Object.keys(addrUpdates).length) updates.addressDetails = {...updates.addressDetails,...addrUpdates};

        updates.addressDetails = {
            ...profile.addressDetails,
            ...addrUpdates,
        }

        if (req.files?.businessProfilePhotoUrl?.length) updates.userProfilePhotoUrl = req.files?.businessProfilePhotoUrl?.[0]?.path;
        if (req.files?.businessProfilePhotoUrl?.length) updates.businessProfilePhotoUrl = req.files?.businessProfilePhotoUrl?.[0]?.path;


        // console.log(updates);
        const updatedProfile = await HostProfileModel.findOneAndUpdate(
            { firebaseUid: uid },
            { $set: updates },
            { new: true }
        );

        // send notification for host
        await createNotification({
            userId: updatedProfile._id,
            userModel: "HostProfile",
            type: "HOST_PROFILE_UPDATED",
            title: "Profile Updated.",
            message: "Your host profile has been updated successfully.",
            link: "/profile/host", 
            meta: {
                profileId: updatedProfile._id
            }
        })

        return res.status(200).json({
            message: "Host profile updated",
            updatedProfile: updatedProfile
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Error"
        })
    }
}


//  this controller is working but it is optional to use
// to update the profile only by json it does not support files
// const editProfileViaJson = async (req, res) => {
//     const {uid,email,email_verified}=req.firebaseUser;
//         // console.log(uid);
//         // console.log(email);
//         // console.log(email_verified);
//     try {
//         // const firebaseUid = req.params.firebaseUid;
//         const profile = await HostProfileModel.findOne({ uid });
//         if (!profile) return res.status(404).json({ message: "Host not found" });

//         const updates = {};
//         const fields = ["firstName", "lastName", "businessName", "phone", "gmail", "description"];
//         fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

//         // Address
//         const addrFields = ["state", "city", "pincode", "address", "landmark"];
//         const addrUpdates = {};
//         addrFields.forEach(f => {
//             if (req.body[f] !== undefined) {
//                 if (f === "landmark") addrUpdates.landMark = req.body[f];
//                 else if (f === "pincode") addrUpdates.pinCode = req.body[f];
//                 else addrUpdates[f] = req.body[f];
//             }
//         });
//         if (Object.keys(addrUpdates).length) updates.addressDetails = addrUpdates;
//         // console.log(updates);
//         const updatedProfile = await HostProfileModel.findOneAndUpdate(
//             { uid }, { $set: updates }, { new: true, runValidators: true }
//         );
//         res.json({ success: true, data: updatedProfile });
//     } catch (err) {
//         console.log(err);
//         console.log(err.message);
//         res.status(500).json({
//             message: "Internal server Error"
//         })
//     }
// }

const getPublicHostProfile = async (req, res) => {
    try {
        //get the id from the url
        const id = req.params.publicId;
        const profileData = await HostProfileModel.findById(id);
        if (!profileData)
            return res.status(404).json({ message: "User Profile Not Found" });
        return res.status(200).json({ profileData: profileData });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        return res.status(500).json({ message: "Internal error", error: err.message });
    }
}

module.exports = { uploadProfile, getProfile, editProfile, getPublicHostProfile };