const jwt = require('jsonwebtoken')
const admin = require('../utils/firebaseAdmin')
const User = require('../models/User')
const generateToken = require('../utils/jwtToken');
const AllyProfileModel = require('../models/AllyModels/AllyProfileModel');
const HostProfileModel = require('../models/HostModels/HostProfileModel')

const register = async (req, res) => {
    let decoded;
    try {
        const { firebaseToken, userName, email, userType } = req.body;
        // console.log(firebaseToken) // from the frontend
        if (!firebaseToken)
            return res.status(400).json({ message: "Firebase token is Missing, User not Authenticated" });
        if (!userType)
            return res.status(400).json({ message: "UserType is required" });

        decoded = await admin.auth().verifyIdToken(firebaseToken); //checks the firebase token valid or not
        // console.log(decoded)

        if (decoded) {
            const checkUser = await User.findOne({ userFirebaseId: decoded.uid });
            // console.log(checkUser);
            if (checkUser)
                return res.status(400).json({ message: "User already Exists" });

            const newUser = new User({
                email,
                userName,
                userFirebaseId: decoded.uid,
                userType
            });

            if (newUser) {
                await newUser.save();

                res.status(201).json({
                    id: newUser._id,
                    userType: newUser.userType,
                    email: newUser.email,
                    message: "user verified successfully"
                });
            } else {
                return res.status(400).json({
                    message: "Invalid user Data"
                })
            }
        }

    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(500).json({
            message: "Invalid firebase Token"
        })
    }
}

const login = async (req, res) => {
    try {
        const { firebaseToken } = req.body;

        if (!firebaseToken)
            return res.status(400).json({ message: "Firebase Token is missing" });

        const decoded = await admin.auth().verifyIdToken(firebaseToken);
        const { uid, email, email_verified, name } = decoded;

        if (!email_verified)
            return res.status(400).json({ message: "User Email is not verified" });

        const getUser = await User.findOne({ userFirebaseId: uid });
        if (!getUser) return res.status(400).json({ message: "Invalid Credentials" });

        generateToken({ decoded }, getUser._id, res); // fcn to generate and send the jwt token

        res.status(200).json({
            id: getUser._id,
            userData: getUser,
            message: "Login successful"
        })
    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(500).json({ message: "Login failed" });
    }
}

const logout = async (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({
        message: "Logged out successful"
    });
}

//this is for popup signup
const autoSignup = async (req, res) => {
    let decoded;
    try {
        const { firebaseToken, userType } = req.body;
        if (!firebaseToken)
            return res.status(400).json({ message: "Firebase Token is missing" });

        if (!userType)
            return res.status(400).json({ message: "User type is missing" });

        decoded = await admin.auth().verifyIdToken(firebaseToken);
        if (!decoded)
            return res.status(400).json({ message: "Invalid firebase Token!" });

        const { uid, email, email_verified, name } = decoded;

        const getUser = await User.findOne({ userFirebaseId: uid });

        // in the auto signup the user no need to enter the data so we checks that user already exists or not
        // if the user exisit we just return the value from db
        // if not exisit we create a new user because this automatic so no need to return "user not found"

        if (!getUser) {
            const newUser = new User({
                email,
                userName: name,
                userFirebaseId: uid,
                userType
            })

            generateToken({ decoded }, newUser._id, res);

            await newUser.save();
            return res.status(201).json({
                id: newUser._id,
                userType: newUser.userType,
                email: newUser.email,
                message: "user verified successfully"
            });
        } else {
            if (getUser.userType.toString() !== userType)
                return res.status(400).json({ message: "User not Found. Clearly check the user type" });
            generateToken({ decoded }, getUser._id, res);
            // if user already exists then we just return the data from the db
            return res.status(200).json({
                id: getUser._id,
                userType: getUser.userType,
                email: getUser.email,
                message: "user verified successfully"
            })
        }
    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// to check that whether the user completes the profile setup or not
const updateProfile = async (req, res) => {
    try {
        const userId = req.firebaseUser.userId;
        const firebaseUserId = req.firebaseUser.uid;
        const userType = req.firebaseUser.userType;

        if (userType === "ally") {
            const getAllyProfile = await AllyProfileModel.findOne({ firebaseUid: firebaseUserId });
            if (!getAllyProfile)
                return res.status(400).json({
                    message: "Profile Not Found. Complete Profile First"
                })
        } else {
            const getHostProfile = await HostProfileModel.findOne({ firebaseUid: firebaseUserId });
            if (!getHostProfile)
                return res.status(400).json({
                    message: "Profile not found. Complete profile first"
                })
        }

        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });

        user.isProfileSetupCompleted = true;
        await user.save();

        res.status(200).json({
            message: "Profile updated successFully",
            user
        })
    } catch (err) {
        res.status(500).json({ message: "Something Went Wrong" });
    }
}

// checks using the jwt token
const authMe = async (req, res) => {
    try {
        const id = req.firebaseUser.userId;
        const user = await User.findById(id);
        res.json({
            firebaseId: req.firebaseUser.uid,
            userId: req.firebaseUser.userId,
            email: req.firebaseUser.email,
            verified: req.firebaseUser.email_verified,
            userType: user ? user.userType : null,
            profileSetup:user.isProfileSetupCompleted,
            message: "User Authenticated"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

module.exports = { register, login, logout, authMe, autoSignup, updateProfile };