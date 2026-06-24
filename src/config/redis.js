const {createClient}=require('redis')

const redisClient=createClient({
    url:process.env.REDIS_URL
});

redisClient.on("error",(err)=>{
    console.error("redis error:",err);
})

const connectRedis=async()=>{
    try {
        await redisClient.connect();
        console.log("redis connected.");
    } catch (err) {
        console.error("redis connection failed:",err);
        process.exit(1);
    }
}

module.exports={redisClient,connectRedis};

