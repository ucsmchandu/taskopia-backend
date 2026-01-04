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
//PATCH     /:taskId/cancel/task     Host cancel task
const express = require('express')
const applyTaskRouter = express.Router();
const checkAuth = require('../middlewares/auth.middleware')
const { applyTask,
    getApplication,
    getMyApplications,
    getSingleApplication,
    updateApplicationStatus,
    cancelApplication,
    cancelTask,
    getApplicationsCount,
    checkAllyAppliedTask,
    getMyApplicationsDetails,
    markTaskCompleted } = require('../controllers/AllyControllers/apply.task.controller')

applyTaskRouter.post('/:taskId/apply', checkAuth, applyTask);
applyTaskRouter.get('/:taskId/applicants', checkAuth, getApplication)
applyTaskRouter.get('/applications/me', checkAuth, getMyApplications)
applyTaskRouter.get('/application/details/me',checkAuth,getMyApplicationsDetails);
applyTaskRouter.get('/application/:applicationId', checkAuth, getSingleApplication)
applyTaskRouter.patch('/application/:id/status', checkAuth, updateApplicationStatus);
applyTaskRouter.patch('/application/:id/cancel', checkAuth, cancelApplication)
applyTaskRouter.get('/:taskId/my-application', checkAuth, checkAllyAppliedTask);
applyTaskRouter.get('/:taskId/applicants/count', checkAuth, getApplicationsCount);
applyTaskRouter.patch('/:taskId/complete', checkAuth, markTaskCompleted)
applyTaskRouter.patch('/:taskId/cancel/task', checkAuth, cancelTask)

module.exports = applyTaskRouter;