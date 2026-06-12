const jwt = require('jsonwebtoken')

/**
 * Authenticates a request by verifying the JWT stored in the jwt cookie.
 *
 * On success, the decoded token payload is attached to req.firebaseUser before passing control onward.
 *
 * @async
 * @param {import('express').Request} req - Express request containing the jwt cookie.
 * @param {import('express').Response} res - Express response used to return authentication errors.
 * @param {import('express').NextFunction} next - Express next callback called after successful authentication.
 * @returns {Promise<void>}
 */
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
        res.status(401).json({
            message: "Invalid token"
        })
    }
}

module.exports=checkAuth;
