const {rateLimit} = require('express-rate-limit')

const windowMs = 15 * 60 * 1000;

const rateLimiter=rateLimit({
    windowMs:windowMs,
    limit:200,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        res.status(429).json({
            success:false,
            message:`Too many requests from this IP. please try again after ${Math.ceil(windowMs/60000)} minutes.`
        })
    },
})

const authRateLimiter=rateLimit({
    windowMs:windowMs,
    limit:20,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        res.status(429).json({
            success:false,
            message:"Too many auth attempts. please try again after 15 min."
        })
    }
})

module.exports={rateLimiter,authRateLimiter};