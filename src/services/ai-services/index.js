const express=require('express')
const AIRoute = express.Router()

const taskPostingHelper=require('./controllers/post-task')
const taskDetailsTranslate=require('./controllers/task-translate')

// rag
const answerQuestion=require('./rag/answerQuestion');

AIRoute.post('/post-task', taskPostingHelper);
AIRoute.post('/translate-task',taskDetailsTranslate);

// rag
AIRoute.post('/rag-chat',answerQuestion);


module.exports = AIRoute;