const express = require('express')
const taskRouter = express.Router();
const { uploadTask, getAllTasks, deleteTask, getTask, editTask } = require('../controllers/HostControllers/post.task.controller')
const checkAuth = require('../middlewares/auth.middleware')
const upload = require('../utils/multer')

taskRouter.post('/upload/task', checkAuth, upload.single("attachments"), uploadTask);
taskRouter.get('/get/all/tasks', getAllTasks);
taskRouter.get('/get/task/:id', getTask)
taskRouter.delete("/delete/task/:taskId", checkAuth,deleteTask)
taskRouter.patch("/edit/task/:id",checkAuth,upload.single("attachments"),editTask);

module.exports = taskRouter;