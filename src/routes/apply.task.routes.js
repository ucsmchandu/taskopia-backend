// Method	Endpoint	What it does
// POST	/tasks/:taskId/apply	Ally applies
// GET	/tasks/:taskId/applicants	Host sees all applicants
// GET	/applications/me	Ally sees their applications
// GET	/applications/:id	Get one application
// PATCH	/applications/:id/status	Host accepts / rejects
// PATCH	/applications/:id/cancel	Ally cancels application
// GET	/tasks/:taskId/my-application	Check if ally already applied
// GET	/tasks/:taskId/applicants/count	Count applicants
// PATCH	/tasks/:taskId/complete	Mark task completed (not application)

const express=require('express')
const applyTaskRouter=express.Router();
const checkAuth=require('../middlewares/auth.middleware')
const {applyTask,getApplication}=require('../controllers/AllyControllers/apply.task.controller')

applyTaskRouter.post('/:taskId/apply',checkAuth,applyTask);
applyTaskRouter.get('/:taskId/applicants',checkAuth,getApplication)

module.exports=applyTaskRouter;