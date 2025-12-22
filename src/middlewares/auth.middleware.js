const jwt = require('jsonwebtoken')

const checkAuth = async (req, res, next) => {
    const token = req.cookies.jwt
    if (!token)
        return res.status(401).json({ message: "User not Authenticated" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.firebaseUser = decoded;
        next()
    } catch (err) {
        console.log(err);
        console.log(err.message)
        res.status(500).json({
            message: "Invalid token"
        })
    }
}

module.exports=checkAuth;