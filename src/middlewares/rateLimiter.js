const { rateLimit } = require('express-rate-limit');
const { redisClient } = require('../config/redis');
const RedisRateLimitStore = require('./redisRateLimitStore');

const windowMs = 15 * 60 * 1000;

const createRedisStore = (prefix) =>
    new RedisRateLimitStore({
        client: redisClient,
        prefix,
        windowMs,
    });

const rateLimiter = rateLimit({
    windowMs,
    limit:200,
    standardHeaders:true,
    legacyHeaders:false,
    store: createRedisStore('taskopia:rate-limit:global'),
    handler:(req,res)=>{
        res.status(429).json({
            success:false,
            message:`Too many requests from this IP. please try again after ${Math.ceil(windowMs/60000)} minutes.`
        })
    },
})

const authRateLimiter = rateLimit({
    windowMs,
    limit:20,
    standardHeaders:true,
    legacyHeaders:false,
    store: createRedisStore('taskopia:rate-limit:auth'),
    handler:(req,res)=>{
        res.status(429).json({
            success:false,
            message:"Too many auth attempts. please try again after 15 min."
        })
    }
})

module.exports={rateLimiter,authRateLimiter};
