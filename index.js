require('dotenv').config();
const express = require("express");
const cors = require('cors');
const connectDB = require('./db')
const route = require('./src/routes/index'); // import from the routes folder
const cookieParser = require('cookie-parser');

// cron jobs
const cron = require("node-cron");
const autoExpiresTasks = require('./src/cron-jobs/autoExpiresTasks')
const autoCompleteTasks = require('./src/cron-jobs/autoCompleteTasks')

// AI related
const AIRoute = require('./src/services/ai-services/index')

// redis
const {connectRedis}=require('./src/config/redis');

// rate limiter
const { rateLimiter } = require('./src/middlewares/rateLimiter');

// rag database
const {connectRagDB}=require('./src/services/ai-services/db/db')

const app = express();
app.set('trust proxy', 1);
app.use(cors({
    origin: ["http://localhost:5173", 'https://taskopia-one.vercel.app'],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}))
app.use(rateLimiter);
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use('/taskopia/u1/api', route);

// AI route
app.use('/taskopia/ai/api', AIRoute);

// jobs for every 10 min
cron.schedule("*/10 * * * *", async () => {
    console.log("Running background jobs...")
    await autoCompleteTasks();
    await autoExpiresTasks();
});


const startServer = async () => {
    await connectDB();
    await connectRagDB();
    await connectRedis();

    app.listen(process.env.PORT, () => {
        console.log(`server runs on ${process.env.PORT || 3000} port`);
    })
}

startServer().catch((err) => {
    console.error("failed to start server:", err);
    process.exit(1);
});
