const jwt = require('jsonwebtoken')

const generateToken = async ({ decoded }, res) => {
    const { uid, email, name, email_verified } = decoded;
    try {
        const token = jwt.sign({ uid, email, email_verified, name }, process.env.JWT_SECRET, {
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