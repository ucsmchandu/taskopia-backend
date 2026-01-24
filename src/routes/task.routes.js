const express = require('express')
const taskRouter = express.Router();
const { uploadTask, getAllTasks, getActiveTasks, deleteTask, getTask, editTask,getHostTasks } = require('../controllers/HostControllers/post.task.controller')
const checkAuth = require('../middlewares/auth.middleware')
const upload = require('../utils/multer')

taskRouter.post('/upload/task', checkAuth, upload.single("attachments"), uploadTask);
taskRouter.get('/get/all/tasks', getAllTasks);
taskRouter.get('/get/all/active/tasks',checkAuth,getActiveTasks)
taskRouter.get('/get/host/tasks',checkAuth,getHostTasks);
taskRouter.get('/get/task/:id', getTask)
taskRouter.patch("/delete/task/:taskId", checkAuth,deleteTask)
taskRouter.patch("/edit/task/:id",checkAuth,upload.single("attachments"),editTask);

module.exports = taskRouter;