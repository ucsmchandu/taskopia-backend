const jwt = require('jsonwebtoken')

/**
 * Generates a signed JWT for an authenticated Firebase user and stores it in an HTTP-only cookie.
 *
 * @async
 * @param {Object} firebasePayload - Wrapper containing the decoded Firebase user.
 * @param {Object} firebasePayload.decoded - Decoded Firebase token payload.
 * @param {string} firebasePayload.decoded.uid - Firebase user id.
 * @param {string} firebasePayload.decoded.email - Firebase user email.
 * @param {string} [firebasePayload.decoded.name] - Firebase display name.
 * @param {boolean} firebasePayload.decoded.email_verified - Whether the Firebase email is verified.
 * @param {import('mongoose').Types.ObjectId|string} userId - MongoDB user id.
 * @param {string} userType - Taskopia role, such as ally or host.
 * @param {import('express').Response} res - Express response used to set the jwt cookie.
 * @returns {Promise<string|undefined>} The generated JWT, or undefined if signing fails.
 */
const generateToken = async ({ decoded },userId, userType, res) => {
    const { uid, email, name, email_verified } = decoded;
    try {
        const token = jwt.sign({ uid, email, email_verified, name,userId, userType }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })
        return token;
    } catch (err) {
        console.log("Error at jwtToken.js file: ", err);

    }
}

module.exports=generateToken;
