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




connectDB();
const app = express();
app.use(cors({
    origin: ["http://localhost:5173", 'https://taskopia-one.vercel.app'],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}))
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use('/taskopia/u1/api', route);

// jobs for every 10 min
cron.schedule("*/10 * * * *", async () => {
    console.log("Running background jobs...")
    await autoCompleteTasks();
    await autoExpiresTasks();
});



app.listen(process.env.PORT, () => {
    console.log("server runs on 3000 port");
})