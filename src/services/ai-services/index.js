const express=require('express')
const AIRoute = express.Router()

const taskPostingHelper=require('./post-task')


AIRoute.post('/post-task', taskPostingHelper);


module.exports = AIRoute;