const HostProfileModel = require('../../models/HostModels/HostProfileModel')

// to upload the host profile data
const uploadProfile = async (req, res) => {
    try {
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
        } = req.body;
        // here the two image urls are comes from the middleware which uses cloudinary to store the images
        const newHostProfile = new HostProfileModel({
            firebaseUid: firebaseUid,
            userProfilePhotoUrl: req.files?.userProfilePhotoUrl?.[0]?.path,
            businessProfilePhotoUrl: req.files?.businessProfilePhotoUrl?.[0]?.path,
            firstName: firstName,
            lastName: lastName,
            businessName: businessName,
            phone: phone,
            gmail: gmail,
            description: description,
            addressDetails: [{
                state: state,
                city: city,
                pinCode: pincode,
                address: address,
                landMark: landmark
            }],
        })
        await newHostProfile.save();
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
        // const {firebaseId}=req.body;
        const firebaseId = req.params.firebaseId;
        const profileData = await HostProfileModel.findOne({ firebaseUid: firebaseId });
        // console.log(profileData)
        if (!profileData)
            return res.status(404).json({ message: "user not found" });
        return res.status(200).json({ profileData: profileData });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        return res.status(500).json({ message: "Internal error", error: err.message });
    }
}

const editProfile = async (req, res) => {
    /**
     router.patch("/profile/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

     */

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
    const updates={};
    if(firstName) updates.firstName=firstName
    if(lastName) updates.lastName=lastName
    if(businessName) updates.businessName=businessName
    if(phone) updates.phone=phone
    if(gmail) updates.gmail=gmail
    if(state) updates.state=state 
    if(city) updates.city=city
    if(pincode) updates.pincode=pincode
    if(address) updates.address=address
    if(landmark) updates.landmark=landmark
    if(description) updates.description=description

    


}

module.exports = { uploadProfile, getProfile, editProfile };