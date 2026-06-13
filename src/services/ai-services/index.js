const express=require('express')
const AIRoute = express.Router()

const taskPostingHelper=require('./controllers/post-task')
const taskDetailsTranslate=require('./controllers/task-translate')

AIRoute.post('/post-task', taskPostingHelper);
AIRoute.post('/translate-task',taskDetailsTranslate);


module.exports = AIRoute;