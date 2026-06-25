const {redisClient}=require('../../config/redis')
const AllyProfileModel = require('../../models/AllyModels/AllyProfileModel')
const createNotification = require('../../utils/createnotification');


const profileCacheKey="allyProfile:all";
const getProfileCacheKey=(id)=>`allyProfile:${id}`;

const invalidateProfileCaches=async(profileId)=>{
    const keys=[profileCacheKey];

    if(profileId)
        keys.push(getProfileCacheKey(profileId))

    try{
        await redisClient.del(...keys);
    }catch(err){
        console.error('redis invalidation error',err);
    }
}

/**
 * Creates an ally profile for the authenticated Firebase user.
 *
 * @async
 * @param {import('express').Request} req - Authenticated request containing ally profile fields in the body and an optional uploaded profile photo.
 * @param {import('express').Response} res - Express response used to return the created ally profile.
 * @returns {Promise<void>}
 */
const uploadProfile = async (req, res) => {
    try {
        const { uid, email, email_verified } = req.firebaseUser;
        const {
            firstName,
            lastName,
            age,
            phone,
            gmail,
            description,
            state,
            city,
            pinCode,
            latitude,
            longitude
        } = req.body;

        const newAllyProfile = new AllyProfileModel({
            firebaseUid: uid,
            userProfilePhotoUrl: req.file?.path,
            firstName,
            lastName,
            age,
            phone,
            gmail,
            description,
            addressDetails: {
                state,
                city,
                pinCode,
                coordinates: {
                    latitude,
                    longitude
                }
            }
        })

        await newAllyProfile.save();

        // invalidate the cache
        await invalidateProfileCaches(newAllyProfile.firebaseUid)

        // send notification for ally
        await createNotification({
            userId: newAllyProfile._id,
            userModel: "AllyProfile",
            type: "ALLY_PROFILE_CREATED",
            title: "Profile Created.",
            message: "Your ally profile has been created successfully.",
            link: "/profile/ally",
            meta: {
                profileId: newAllyProfile._id
            }
        })
        return res.status(200).json({
            message: "Ally profile is saved successfully",
            profileId: newAllyProfile._id,
            profileData: newAllyProfile
        });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        return res.status(500).json({ message: "upload file data failed", error: err.message });
    }
}

/**
 * Gets the authenticated ally user's profile.
 *
 * @async
 * @param {import('express').Request} req - Authenticated request with firebaseUser populated by middleware.
 * @param {import('express').Response} res - Express response used to return the ally profile.
 * @returns {Promise<void>}
 */
const getProfile = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;

        try{
            const cachedProfile=await redisClient.get(getProfileCacheKey(uid));
            if(cachedProfile){
                return res.status(200).json({
                    profileData:JSON.parse(cachedProfile)
                })
            }
        }catch(err){
            console.error('redis cache error:',err);
        }

        const profileData = await AllyProfileModel.findOne({ firebaseUid: uid })
        if (!profileData)
            return res.status(404).json({ message: "user not found" });

        try{
            await redisClient.set(getProfileCacheKey(uid),JSON.stringify(profileData),{
                EX:300
            });
        }catch(err){
            console.error('redis cache error:',err);
        }

        return res.status(200).json({ profileData: profileData });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        return res.status(500).json({ message: "Internal error", error: err.message });
    }
}

/**
 * Updates the authenticated ally user's profile fields and optional profile photo.
 *
 * @async
 * @param {import('express').Request} req - Authenticated request containing editable profile fields in the body and an optional uploaded file.
 * @param {import('express').Response} res - Express response used to return the updated ally profile.
 * @returns {Promise<void>}
 */
const editProfile = async (req, res) => {
    try {
        const { uid } = req.firebaseUser;

        const profile = await AllyProfileModel.findOne({ firebaseUid: uid });
        if (!profile)
            return res.status(404).json({ message: "Host Not found!" });

        const updates = {};

        const fields = ["firstName", "lastName", "age", "phone", "gmail", "description"];
        fields.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

        const addrFields = ["state", "city", "pinCode"];
        const locFields = ["latitude", "longitude"]
        const addrUpdates = {};
        const locUpdates = {};
        addrFields.forEach((field) => { if (req.body[field] !== undefined) addrUpdates[field] = req.body[field]; })
        locFields.forEach((field) => { if (req.body[field] !== undefined) locUpdates[field] = req.body[field]; })

        updates.addressDetails = {
            ...profile.addressDetails,          // keep existing state/city/pinCode
            ...addrUpdates,
            coordinates: {
                ...profile.addressDetails?.coordinates, // keep existing coords
                ...locUpdates
            }
        };

        if (req.file?.path) updates.userProfilePhotoUrl = req.file?.path;

        const updatedProfile = await AllyProfileModel.findOneAndUpdate(
            { firebaseUid: uid },
            { $set: updates },
            { new: true }
        );

        // invalidate cache
        await invalidateProfileCaches(uid);

        // send notification for the ally
        await createNotification({
            userId: updatedProfile._id,
            userModel: "AllyProfile",
            type: "ALLY_PROFILE_UPDATED",
            title: "Profile Updated.",
            message: "Your ally profile has been updated successfully.",
            link: "/profile/ally", 
            meta: {
                profileId: updatedProfile._id
            }
        })
        return res.status(200).json({
            message: "Ally profile updated",
            updatedProfile: updatedProfile
        })
        // console.log(updates);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Error"
        })
    }
}

/**
 * Gets a public ally profile by profile id.
 *
 * @async
 * @param {import('express').Request} req - Express request containing publicId in route params.
 * @param {import('express').Response} res - Express response used to return the public ally profile.
 * @returns {Promise<void>}
 */
const getPublicAllyProfile = async (req, res) => {
    try {
        const id = req.params.publicId;

        // cache
        try{
            const cacheProfile=await redisClient.get(getProfileCacheKey(id));
            if(cacheProfile){
                return res.status(200).json({
                    profileData:JSON.parse(cacheProfile)
                })
            }
        }catch(err){
            console.error('redis cache error:',err);
        }

        const profileData = await AllyProfileModel.findById(id);
        if (!profileData)
            return res.status(404).json({ message: "User profile Not Found" })

        try{
            await redisClient.set(getProfileCacheKey(id),JSON.stringify(profileData),{
                EX:300
            })
        }catch(err){
            console.error('redis cache error:',err);
        }

        return res.status(200).json({ profileData: profileData });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = { uploadProfile, getProfile, editProfile, getPublicAllyProfile };
